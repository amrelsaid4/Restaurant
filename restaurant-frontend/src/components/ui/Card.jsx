import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const cardClasses = `${baseClasses} ${hoverClasses} ${padding} ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card; 