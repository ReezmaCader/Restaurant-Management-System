import React, { useEffect } from 'react';
import './ToastMessage.css';

function ToastMessage({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-message toast-${type}`}> 
      <span className="toast-icon">
        {type === 'success' ? '🎉' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="toast-text">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

export default ToastMessage;
