import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg",
        secondary: "bg-secondary text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-md hover:shadow-lg",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-indigo-500",
        ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
