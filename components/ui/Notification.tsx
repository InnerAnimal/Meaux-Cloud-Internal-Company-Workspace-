'use client';

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function Notification({ message, type }: NotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const colors = {
    success: 'border-l-4 border-success',
    error: 'border-l-4 border-danger',
    warning: 'border-l-4 border-warning',
    info: 'border-l-4 border-primary',
  };

  return (
    <div
      className={`fixed top-8 right-8 bg-white border border-border rounded-lg p-4 shadow-lg z-50 transition-transform duration-300 ${
        show ? 'translate-x-0' : 'translate-x-[200%]'
      } ${colors[type]}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
