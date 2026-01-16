import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
    return (
        <div className={`bg-white rounded-xl p-6 border border-gray-100 ${hover ? 'hover:shadow-xl hover:-translate-y-1' : 'shadow-md'} transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
