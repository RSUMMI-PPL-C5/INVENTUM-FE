'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Notification {
  id: string;
  title?: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  requestId?: string;
  user?: {
    id: string;
    name: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const getUserRole = () => {
      try {
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('Error parsing user data from cookies:', error);
      }
    };
    
    getUserRole();
  }, []);
  
  // Cek jika user adalah Admin atau Fasum berdasarkan role dari cookie
  const isAdminOrFasum = () => {
    return userRole === 'Admin' || userRole === 'Fasum';
  };

  const fetchNotifications = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        setNotifications([]);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.warn('API URL is not configured');
        return;
      }

      // Gunakan endpoint yang sesuai berdasarkan peran pengguna
      const endpoint = isAdminOrFasum() ? '/notification' : '/notification/my';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setNotifications([]);
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      const formattedNotifications = data.data.map((n: any) => ({
        id: n.id,
        title: n.request?.requestType === 'MAINTENANCE' ? 'Permintaan Pemeliharaan' : 'Permintaan Kalibrasi',
        message: n.message,
        timestamp: new Date(n.createdOn).toLocaleString(),
        read: n.isRead,
        type: 'info',
        requestId: n.requestId,
        // Tambahkan informasi pengguna jika available (untuk Admin/Fasum)
        user: n.user ? {
          id: n.user.id,
          name: n.user.name,
        } : undefined
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) return;

      const notification = notifications.find(n => n.id === id);
      
      if (notification?.requestId) {
        const requestType = notification.title?.toLowerCase().includes('kalibrasi') ? 
          'calibration' : 'maintenance';
          
        router.push(`/dashboard/detail-request?type=${requestType}&id=${notification.requestId}`);
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      const response = await fetch(`${apiUrl}/notification/${id}/read`, {
        method: 'PATCH', // Sesuai dengan backend
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => fetch(`${apiUrl}/notification/${n.id}/read`, {
            method: 'PATCH', // Sesuai dengan backend
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }))
      );
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (userRole) { // Hanya fetch jika role user sudah tersedia
      fetchNotifications();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]); // Tambahkan userRole sebagai dependency

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}