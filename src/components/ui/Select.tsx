import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const selectId = id || label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div>
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select
        id={selectId}
        className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};