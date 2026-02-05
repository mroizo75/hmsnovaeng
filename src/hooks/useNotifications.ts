"use client";

import { useEffect, useState, useRef } from "react";
import type { Notification as NotificationModel } from "@prisma/client";

const STREAM_URL = "/api/notifications/stream";
const POLL_INTERVAL_MS = 45000; // 45 sekunder i produksjon
const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * SSE gir ofte ERR_HTTP2_PROTOCOL_ERROR på Vercel fordi:
 * - Serverless-funksjoner har timeout (f.eks. 60s), så langvarige streams kuttet
 * - Vercel buffrer/avslutter streams annerledes enn vanlig Node
 * I produksjon bruker vi derfor kun polling – ingen åpen SSE-tilkobling = ingen feil.
 */
const useStream = typeof window !== "undefined" && process.env.NODE_ENV !== "production";

type MessageCallback = (data: Record<string, unknown>) => void;

let shared: {
  eventSource: EventSource | null;
  listeners: Set<MessageCallback>;
  reconnectDelay: number;
  reconnectAttempts: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
} = {
  eventSource: null,
  listeners: new Set(),
  reconnectDelay: INITIAL_RECONNECT_DELAY,
  reconnectAttempts: 0,
  timeoutId: null,
};

function connectStream(): void {
  if (shared.listeners.size === 0) return;
  if (shared.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  shared.eventSource = new EventSource(STREAM_URL);

  shared.eventSource.addEventListener("message", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      if (data.type === "connected") {
        shared.reconnectDelay = INITIAL_RECONNECT_DELAY;
        shared.reconnectAttempts = 0;
        return;
      }
      shared.listeners.forEach((cb) => cb(data));
    } catch {
      // Ignore parse errors
    }
  });

  shared.eventSource.addEventListener("error", () => {
    shared.eventSource?.close();
    shared.eventSource = null;
    shared.reconnectAttempts += 1;
    if (shared.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      if (shared.timeoutId) clearTimeout(shared.timeoutId);
      shared.timeoutId = null;
      return;
    }
    const delay = shared.reconnectDelay;
    shared.reconnectDelay = Math.min(
      shared.reconnectDelay * 2,
      MAX_RECONNECT_DELAY
    );
    shared.timeoutId = setTimeout(connectStream, delay);
  });
}

function subscribeToStream(cb: MessageCallback): () => void {
  shared.listeners.add(cb);
  if (
    !shared.eventSource ||
    shared.eventSource.readyState === EventSource.CLOSED
  ) {
    connectStream();
  }
  return () => {
    shared.listeners.delete(cb);
    if (shared.listeners.size === 0) {
      if (shared.timeoutId) clearTimeout(shared.timeoutId);
      shared.eventSource?.close();
      shared.eventSource = null;
      shared.reconnectDelay = INITIAL_RECONNECT_DELAY;
      shared.reconnectAttempts = 0;
    }
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const prevUnreadRef = useRef<number>(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/notifications?limit=10");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications ?? []);
          const count = data.unreadCount ?? 0;
          setUnreadCount(count);
          prevUnreadRef.current = count;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch notifications:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  // I produksjon: bruk kun polling (unngår HTTP/2/SSE-feil på Vercel)
  useEffect(() => {
    if (!useStream) return;

    const unsubscribe = subscribeToStream((data) => {
      setNotifications((prev) => [data as NotificationModel, ...prev].slice(0, 10));
      setUnreadCount((prev) => prev + 1);
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const payload = data as { title?: string; message?: string; id?: string };
        new Notification(payload.title ?? "Varsel", {
          body: payload.message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: payload.id,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Polling i produksjon – oppdater liste og unread count jevnlig (ingen åpen stream)
  useEffect(() => {
    if (useStream) return;

    const poll = async () => {
      try {
        const response = await fetch("/api/notifications?limit=10");
        if (!response.ok) return;
        const data = await response.json();
        setNotifications(data.notifications ?? []);
        const newUnread = data.unreadCount ?? 0;
        if (newUnread > prevUnreadRef.current && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const latest = (data.notifications as NotificationModel[])?.[0];
          if (latest && !latest.isRead) {
            new Notification(latest.title ?? "Varsel", {
              body: latest.message ?? "",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: latest.id,
            });
          }
        }
        prevUnreadRef.current = newUnread;
        setUnreadCount(newUnread);
      } catch {
        // Stille feil – ikke spam konsollen
      }
    };

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    void poll();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    Notification.requestPermission();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to mark all as read:", error);
      }
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const wasUnread = notifications.find(
          (n) => n.id === notificationId
        )?.isRead === false;
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete notification:", error);
      }
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
