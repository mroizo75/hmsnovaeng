"use client";

import { useEffect, useState } from "react";
import type { Notification as NotificationModel } from "@prisma/client";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Hent initielle varsler
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
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  // Koble til SSE for real-time oppdateringer
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      eventSource = new EventSource("/api/notifications/stream");

      eventSource.addEventListener("message", (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          if (notification.type !== "connected") {
            // Legg til ny varsling
            setNotifications((prev) => [notification, ...prev].slice(0, 10));
            setUnreadCount((prev) => prev + 1);

            // Vis browser-notifikasjon hvis tillatt
            if (Notification.permission === "granted") {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
              });
            }
          }
        } catch (error) {
          console.error("Failed to parse notification:", error);
        }
      });

      eventSource.addEventListener("error", () => {
        eventSource?.close();
        // Prøv å koble til igjen etter 5 sekunder
        reconnectTimeout = setTimeout(connect, 5000);
      });
    }

    connect();

    // Be om tillatelse til browser-notifikasjoner
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
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
      console.error("Failed to mark as read:", error);
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
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        const wasUnread = notifications.find((n) => n.id === notificationId)?.isRead === false;
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
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

