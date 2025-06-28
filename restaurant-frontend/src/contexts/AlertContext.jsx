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
  const [timeoutId, setTimeoutId] = useState(null);

  const showAlert = (message, type = 'info', title = null, duration = 2000) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setAlert({
      message,
      type, // 'success', 'error', 'warning', 'info'
      title,
      duration,
      id: Date.now()
    });

    // Auto hide after duration
    if (duration > 0) {
      const newTimeoutId = setTimeout(() => {
        setAlert(null);
        setTimeoutId(null);
      }, duration);
      setTimeoutId(newTimeoutId);
    }
  };

  const hideAlert = () => {
    // Clear the timeout when manually hiding
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setAlert(null);
  };

  const showSuccess = (message, title = null) => {
    showAlert(message, 'success', title, 1500); // Shorter, less intrusive
  };

  const showError = (message, title = 'Error') => {
    showAlert(message, 'error', title, 4000); // Slightly shorter
  };

  const showWarning = (message, title = 'Warning') => {
    showAlert(message, 'warning', title, 2500);
  };

  const showInfo = (message, title = null) => {
    showAlert(message, 'info', title, 2000);
  };

  // Silent success for non-critical actions (cart updates, etc.)
  const showSilentSuccess = () => {
    // Do nothing - for routine actions that don't need user notification
  };

  const value = {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSilentSuccess
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext; 