import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input
        id={inputId}
        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        {...props}
      />
    </div>
  );
};