import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types.ts';
import { BellIcon } from './icons/NavIcons.tsx';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';

interface NotificationBellProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onRequestPermission: () => void;
  permission: NotificationPermission;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onDismiss, onRequestPermission, permission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
        <BellIcon />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {permission === 'default' && (
                <div className="p-4 text-center border-b bg-slate-50">
                    <p className="text-sm text-slate-600 mb-2">Get reminders with browser notifications.</p>
                    <Button onClick={onRequestPermission} variant="secondary" size="sm">Enable Notifications</Button>
                </div>
            )}
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No new notifications.</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="p-3 border-b last:border-b-0 hover:bg-slate-50 flex items-start gap-3">
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-700 text-sm">{notification.title}</p>
                    <p className="text-slate-600 text-sm">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <button 
                    onClick={() => onDismiss(notification.id)} 
                    className="text-slate-400 hover:text-slate-600 mt-0.5"
                    aria-label="Dismiss notification"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
