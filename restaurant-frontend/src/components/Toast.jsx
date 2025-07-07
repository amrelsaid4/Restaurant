import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            border: '1px solid #10B981',
            color: '#10B981',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            border: '1px solid #EF4444',
            color: '#EF4444',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default Toast; 