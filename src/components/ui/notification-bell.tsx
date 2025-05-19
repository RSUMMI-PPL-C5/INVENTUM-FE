"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationBellProps {
  count?: number;
  notifications?: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type?: "info" | "success" | "warning" | "error";
  }[];
  onNotificationClick?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export function NotificationBell({
  count = 0,
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifikasi</h3>
          {count > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Tandai semua sudah dibaca
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full text-left p-4 hover:bg-gray-50 transition-colors",
                    !notification.read && "bg-blue-50"
                  )}
                  onClick={() => onNotificationClick?.(notification.id)}
                >
                  <div className="flex justify-between mb-1">
                    <span className={cn(
                      "font-medium",
                      !notification.read && "text-blue-800"
                    )}>
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t text-center">
          <button className="text-sm text-blue-600 hover:underline">
            Lihat semua notifikasi
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 