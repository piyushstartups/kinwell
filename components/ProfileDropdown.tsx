import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types.ts';
import { LogoutIcon, ChevronDownIcon, UserIcon } from './icons/ActionIcons.tsx';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onViewProfile: (memberId: string) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onViewProfile }) => {
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
        <span className="hidden sm:inline text-sm font-medium text-slate-700">{user.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-500 hidden sm:inline" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-20">
          <div className="p-2 border-b">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                onViewProfile(user.id);
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
                <UserIcon/> My Profile
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogoutIcon className="h-5 w-5"/> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
