'use client';

import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  recipientId?: string;
}

const API_BASE_URL = 'http://localhost:5174/api/notifications'; // Thay đổi nếu backend của bạn chạy trên cổng khác
const SIGNALR_HUB_URL = 'http://localhost:5174/notificationHub'; // Thay đổi nếu backend của bạn chạy trên cổng khác

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newRecipientId, setNewRecipientId] = useState('');
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/unread?recipientId=user123`); // Lấy thông báo chưa đọc cho user123
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();

    // 2. Setup SignalR connection
    const setupSignalR = async () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_HUB_URL, {
          skipNegotiation: true, // Thường dùng cho localhost hoặc khi biết chắc chắn giao thức (WebSocket)
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveNotification', (notification: Notification) => {
        console.log('New notification received:', notification);
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      });

      connection.onreconnected(() => {
        console.log('SignalR Reconnected!');
        fetchNotifications(); // Fetch lại thông báo khi kết nối lại
      });

      try {
        await connection.start();
        console.log('SignalR Connected!');
        connectionRef.current = connection;
      } catch (err) {
        console.error('Error connecting to SignalR:', err);
      }
    };

    setupSignalR();

    // Cleanup on component unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log('SignalR Disconnected!');
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/${id}/mark-as-read`, {
        method: 'PUT',
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/mark-all-as-read?recipientId=user123`, { // Mark all as read for user123
        method: 'PUT',
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;

    // Call API to create notification
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          message: newMessage,
          recipientId: newRecipientId || null, // Gửi null nếu recipientId trống
        }),
      });
      if (response.ok) {
        const createdNotification: Notification = await response.json();
        // SignalR will push this notification, no need to update state here directly
        setNewTitle('');
        setNewMessage('');
        setNewRecipientId('');
      } else {
        console.error('Failed to create notification:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Ứng Dụng Thông Báo Real-time</h1>

      {/* Form tạo thông báo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tạo Thông Báo Mới</h2>
        <form onSubmit={handleCreateNotification} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề:</label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Nội dung:</label>
            <textarea
              id="message"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700">ID người nhận (Tùy chọn):</label>
            <input
              type="text"
              id="recipientId"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={newRecipientId}
              onChange={(e) => setNewRecipientId(e.target.value)}
              placeholder="VD: user123"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Gửi Thông Báo
          </button>
        </form>
      </div>

      {/* Danh sách thông báo */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Thông Báo Của Bạn</h2>
        <button
          onClick={handleMarkAllAsRead}
          className="bg-green-600 text-white py-1.5 px-3 rounded-md hover:bg-green-700 text-sm"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có thông báo nào.</p>
      ) : (
        <ul className="space-y-4">
          {notifications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((notification) => (
              <li
                key={notification.id}
                className={`p-4 rounded-lg shadow-sm flex justify-between items-center ${
                  notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold">{notification.title}</h3>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                    {notification.recipientId && ` (To: ${notification.recipientId})`}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4 bg-blue-500 text-white py-1.5 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}