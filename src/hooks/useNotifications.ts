"use client";

import { useEffect, useState } from "react";
import type { Notification as NotificationModel } from "@prisma/client";

const STREAM_URL = "/api/notifications/stream";
const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;

type MessageCallback = (data: Record<string, unknown>) => void;

let shared: {
  eventSource: EventSource | null;
  listeners: Set<MessageCallback>;
  reconnectDelay: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
} = {
  eventSource: null,
  listeners: new Set(),
  reconnectDelay: INITIAL_RECONNECT_DELAY,
  timeoutId: null,
};

function connectStream(): void {
  if (shared.listeners.size === 0) return;

  shared.eventSource = new EventSource(STREAM_URL);

  shared.eventSource.addEventListener("message", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      if (data.type === "connected") {
        shared.reconnectDelay = INITIAL_RECONNECT_DELAY;
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
    }
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/notifications?limit=10");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
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

  useEffect(() => {
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
