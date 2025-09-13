import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M12 2.25C6.06.75 3.75 3.75 3.75 6.75V11.25C3.75 16.5 7.5 21.75 12 21.75C16.5 21.75 20.25 16.5 20.25 11.25V6.75C20.25 3.75 17.94.75 12 2.25Z"
            stroke="currentColor"
            className="text-primary-600"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15.62 8.11c.45-.63.36-1.51-.21-2.04-.57-.53-1.45-.42-2.02.21L12 8.01l-1.39-1.73c-.57-.63-1.45-.74-2.02-.21-.57.53-.66 1.41-.21 2.04l2.17 3.03c.3.42.92.49 1.32.14l.06-.05 2.7-2.31Z"
            fill="currentColor"
            className="text-primary-500"
        />
    </svg>
);