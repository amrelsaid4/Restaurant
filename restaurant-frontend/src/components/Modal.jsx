import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'success', showButtons = true }) => {
  if (!isOpen) return null;

  const getIcon = () => {
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
        return '✅';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <span className="modal-icon">{getIcon()}</span>
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        {showButtons && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 