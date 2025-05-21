'use client';

import { useNotifications } from "@/context/notification-provider";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

export default function NotificationPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    try {
      // First try using the standard Date constructor
      const date = new Date(dateString);
      if (isValidDate(date)) {
        return format(date, 'dd MMM yyyy HH:mm', { locale: id });
      }
      
      // If that fails, try handling specific formats
      
      // For format: "M/D/YYYY, H:MM:SS AM/PM" (like "5/21/2025, 12:38:24 PM")
      if (dateString.includes('/') && (dateString.includes('AM') || dateString.includes('PM'))) {
        // Split at the comma to separate date and time
        const [datePart, timePart] = dateString.split(', ');
        
        // Parse the date part (M/D/YYYY)
        const [month, day, year] = datePart.split('/').map(Number);
        
        // Parse the time part (H:MM:SS AM/PM)
        let [time, period] = timePart.split(' ');
        let [hours, minutes, seconds] = time.split(':').map(Number);
        
        // Adjust hours for PM
        if (period === 'PM' && hours < 12) {
          hours += 12;
        }
        // Adjust hours for 12 AM
        if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        // Create a date object (note: months are 0-indexed in JavaScript)
        const parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);
        if (isValidDate(parsedDate)) {
          return format(parsedDate, 'dd MMM yyyy HH:mm', { locale: id });
        }
      }
      
      // For format: "DD/MM/YYYY, HH:MM:SS" (like "21/05/2025, 12:38:24")
      if (dateString.includes('/') && dateString.includes(':')) {
        // Split at the comma to separate date and time
        const [datePart, timePart] = dateString.split(', ');
        
        // Parse the date part (DD/MM/YYYY)
        const dateParts = datePart.split('/');
        // Check if it's in DD/MM/YYYY format by looking at the values
        if (dateParts.length === 3) {
          // Determine if it's DD/MM/YYYY or MM/DD/YYYY
          // If the first number is > 12, it's likely DD/MM/YYYY
          const isLikelyDDMMYYYY = parseInt(dateParts[0]) > 12;
          
          let day, month, year;
          if (isLikelyDDMMYYYY) {
            [day, month, year] = dateParts.map(Number);
          } else {
            [month, day, year] = dateParts.map(Number);
          }
          
          // Parse the time part (HH:MM:SS)
          const [hours, minutes, seconds] = timePart.split(':').map(Number);
          
          // Create a date object (note: months are 0-indexed in JavaScript)
          const parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);
          if (isValidDate(parsedDate)) {
            return format(parsedDate, 'dd MMM yyyy HH:mm', { locale: id });
          }
        }
      }
      
      // If all parsing attempts fail, return the original string
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };
  
  // Helper function to check if a date is valid
  const isValidDate = (date: Date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  const handleMarkAsRead = (id: string) => {
    try {
      markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = () => {
    try {
      markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Notifikasi</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
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
                  {formatDate(notification.timestamp)}
                </span>
              </div>
              <p className="text-muted-foreground">{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
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