import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`toast ${type || 'success'}`}>
      <span className="toast-icon">{renderIcon()}</span>
      <div className="toast-message">{message}</div>
      <button onClick={onClose} className="toast-close-btn" style={{ background: 'none', color: 'inherit' }}>
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
