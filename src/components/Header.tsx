import React from 'react';
import { View, AppNotification, User } from '../types.ts';
import { DashboardIcon, FamilyIcon, CalendarIcon, InsuranceIcon } from './icons/NavIcons.tsx';
import { NotificationBell } from './NotificationBell.tsx';
import { Logo } from './Logo.tsx';
import { ProfileDropdown } from './ProfileDropdown.tsx';

interface HeaderProps {
  user: User;
  activeView: View;
  setActiveView: (view: View) => void;
  notifications: AppNotification[];
  onDismissNotification: (id: string) => void;
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
  onLogout: () => void;
  onViewProfile: (memberId: string) => void;
  isMemberView: boolean;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { 
    user, activeView, setActiveView, notifications, onDismissNotification, 
    onRequestNotificationPermission, notificationPermission, onLogout, 
    onViewProfile, isMemberView 
  } = props;

  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { view: View.Family, label: 'Family', icon: <FamilyIcon /> },
    { view: View.Appointments, label: 'Appointments', icon: <CalendarIcon /> },
    { view: View.Insurance, label: 'Insurance', icon: <InsuranceIcon /> },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Logo className="h-8 w-8 text-primary-600"/>
            <h1 className="text-2xl font-bold text-slate-800 hidden sm:block">Kinwell</h1>
          </div>
          
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-1">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === item.view && !isMemberView
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications}
              onDismiss={onDismissNotification}
              onRequestPermission={onRequestNotificationPermission}
              permission={notificationPermission}
            />
            <ProfileDropdown user={user} onLogout={onLogout} onViewProfile={onViewProfile} />
          </div>
        </div>
      </div>
       {/* Mobile Nav */}
      <nav className="md:hidden flex justify-around p-2 border-t border-slate-200 bg-white">
         {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex flex-col items-center justify-center w-full py-1 rounded-md text-xs font-medium transition-colors ${
                  activeView === item.view && !isMemberView
                    ? 'text-primary-600'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
      </nav>
    </header>
  );
};

export default Header;