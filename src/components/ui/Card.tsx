import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 border border-slate-200/80 ${className}`}>
      {children}
    </div>
  );
};