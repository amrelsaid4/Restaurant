import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 ${typeStyles[type]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{iconMap[type]}</span>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mb-4">{message}</p>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertModal; 