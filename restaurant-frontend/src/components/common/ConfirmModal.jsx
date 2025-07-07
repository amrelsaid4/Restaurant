import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/IconLibrary';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // danger, warning, info
}) => {
  const variants = {
    danger: {
      icon: Icons.warning,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: Icons.warning,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      icon: Icons.info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const currentVariant = variants[variant];

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="min-h-screen px-4 text-center">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={onClose}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
            
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            
            <motion.div
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentVariant.iconBg}`}>
                  {React.createElement(currentVariant.icon, { 
                    className: `w-6 h-6 ${currentVariant.iconColor}` 
                  })}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {title}
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 text-center mb-6">
                {message}
              </p>
              
              {/* Actions */}
              <div className="flex space-x-3">
                <motion.button
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${currentVariant.confirmButton}`}
                  onClick={onConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal; 