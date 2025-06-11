import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info', title = null, duration = 3000) => {
    setAlert({
      message,
      type, // 'success', 'error', 'warning', 'info'
      title,
      duration,
      id: Date.now()
    });

    // Auto hide after duration
    if (duration > 0) {
      setTimeout(() => {
        setAlert(null);
      }, duration);
    }
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showSuccess = (message, title = 'Success!') => {
    showAlert(message, 'success', title);
  };

  const showError = (message, title = 'Error!') => {
    showAlert(message, 'error', title, 5000); // Longer duration for errors
  };

  const showWarning = (message, title = 'Warning!') => {
    showAlert(message, 'warning', title);
  };

  const showInfo = (message, title = 'Info') => {
    showAlert(message, 'info', title);
  };

  const value = {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext; 