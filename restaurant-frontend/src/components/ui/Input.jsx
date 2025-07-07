import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '',
  icon: Icon,
  iconPosition = 'left',
  required = false,
  ...props 
}, ref) => {
  const inputClasses = `
    form-input
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `.trim();
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 