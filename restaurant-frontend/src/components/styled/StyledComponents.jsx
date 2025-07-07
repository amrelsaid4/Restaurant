import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  BoltIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

// إضافة الأيقونات المفقودة
export const AdditionalIcons = {
  eye: EyeIcon,
  eyeOff: EyeSlashIcon,
  lightning: BoltIcon,
  admin: Cog6ToothIcon,
  shield: ShieldCheckIcon,
  mobile: DevicePhoneMobileIcon
};

// مكون أيقونة محسن
export const StyledIcon = ({ icon, className = "w-5 h-5", ...props }) => {
  return React.createElement(icon, { className, ...props });
};

// مكون زر محسن
export const StyledButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
  }`;
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
      )}
      {children}
    </motion.button>
  );
};

// مكون إدخال محسن
export const StyledInput = ({ 
  label, 
  error, 
  helperText, 
  className = '',
  ...props 
}) => {
  const inputClasses = `w-full px-4 py-3 border rounded-lg transition-colors ${
    error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
  } ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// مكون كارت محسن
export const StyledCard = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  const cardClasses = `bg-white rounded-lg shadow-sm border border-gray-200 ${
    hover ? 'hover:shadow-md transition-shadow duration-200' : ''
  } ${className}`;
  
  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default {
  AdditionalIcons,
  StyledIcon,
  StyledButton,
  StyledInput,
  StyledCard
}; 