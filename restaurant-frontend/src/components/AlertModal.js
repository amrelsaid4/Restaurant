import React, { useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';
import './AlertModal.css';

const AlertModal = () => {
  const { alert, hideAlert } = useAlert();

  useEffect(() => {
    if (alert) {
      // Add body class to prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [alert]);

  if (!alert) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'success':
        return 'alert-modal-success';
      case 'error':
        return 'alert-modal-error';
      case 'warning':
        return 'alert-modal-warning';
      case 'info':
        return 'alert-modal-info';
      default:
        return 'alert-modal-info';
    }
  };

  return (
    <div className="alert-modal-overlay" onClick={hideAlert}>
      <div 
        className={`alert-modal ${getTypeClass(alert.type)}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="alert-modal-header">
          <div className="alert-modal-icon">
            {getIcon(alert.type)}
          </div>
          <div className="alert-modal-title">
            {alert.title || 'Notification'}
          </div>
          <button 
            className="alert-modal-close"
            onClick={hideAlert}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="alert-modal-body">
          <p className="alert-modal-message">
            {alert.message}
          </p>
        </div>

        {/* Footer */}
        <div className="alert-modal-footer">
          <button 
            className={`alert-modal-btn alert-modal-btn-${alert.type}`}
            onClick={hideAlert}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal; 