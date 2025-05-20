'use client';

import { useNotifications } from "@/context/notification-provider";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function NotificationPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Notifikasi</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Tandai semua sudah dibaca
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                !notification.read ? 'bg-blue-50 border-blue-100' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-medium ${!notification.read ? 'text-blue-800' : ''}`}>
                  {notification.title || 'Notification'}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(notification.timestamp), 'dd MMM yyyy HH:mm', { locale: id })}
                </span>
              </div>
              <p className="text-muted-foreground">{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Tandai sudah dibaca
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 