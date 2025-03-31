import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getStyles = () => {
    const baseStyles = 'border-l-4';
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-[var(--app-error-bg)] border-[var(--app-error)] text-[var(--app-text)]`;
      case 'success':
        return `${baseStyles} bg-[var(--app-success-bg)] border-[var(--app-success)] text-[var(--app-text)]`;
      case 'warning':
        return `${baseStyles} bg-[var(--app-warning-bg)] border-[var(--app-warning)] text-[var(--app-text)]`;
      case 'info':
        return `${baseStyles} bg-[var(--app-info-bg)] border-[var(--app-info)] text-[var(--app-text)]`;
      default:
        return `${baseStyles} bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text)]`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        ${getStyles()}
        min-w-[300px] max-w-[500px]
        px-6 py-3 rounded-md shadow-lg
        border-l-4
        animate-slide-in
        flex items-center justify-between
        transition-all duration-300 ease-in-out
        hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
        aria-label="Close notification"
      >
        <span aria-hidden="true" className="text-xl">×</span>
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

Toast.defaultProps = {
  duration: 3000
};

export default Toast;

