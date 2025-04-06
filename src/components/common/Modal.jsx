import React, { useEffect, useState, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../../store/uiSlice';
import PropTypes from 'prop-types';

/**
 * Reusable modal component connected to Redux UI state
 * Can be used directly with redux state or with props
 */
const Modal = ({ 
  // Props-based behavior (overrides Redux state)
  isOpen: isOpenProp,
  title: titleProp,
  content: contentProp,
  onConfirm: onConfirmProp,
  onCancel: onCancelProp,
  confirmText: confirmTextProp,
  cancelText: cancelTextProp,
  type: typeProp,
  size = 'medium', // 'small', 'medium', 'large', 'xlarge'
  closeOnOutsideClick = true,
  hideFooter = false
}) => {
  const dispatch = useDispatch();
  
  // Get modal state from Redux (used if props are not provided)
  const modalState = useSelector(state => state.ui.modal);
  const darkMode = useSelector(state => state.ui.darkMode);
  
  // Determine if we're using props or Redux state
  const useReduxState = isOpenProp === undefined;
  
  // State values to use (props override Redux)
  const isOpen = useReduxState ? modalState.isOpen : isOpenProp;
  const title = useReduxState ? modalState.title : titleProp;
  const content = useReduxState ? modalState.content : contentProp;
  const onConfirm = useReduxState ? modalState.onConfirm : onConfirmProp;
  const onCancel = useReduxState ? modalState.onCancel : onCancelProp;
  const confirmText = useReduxState ? modalState.confirmText : confirmTextProp;
  const cancelText = useReduxState ? modalState.cancelText : cancelTextProp;
  const type = useReduxState ? modalState.type : typeProp;
  
  // Local state for animation
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle modal open/close with animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);
  
  // Close modal handler
  const handleClose = () => {
    if (useReduxState) {
      dispatch(closeModal());
    } else if (onCancel) {
      onCancel();
    }
  };
  
  // Confirm action handler
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    
    if (useReduxState) {
      dispatch(closeModal());
    }
  };
  
  // Handle background click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnOutsideClick) {
      handleClose();
    }
  };
  
  // If closed, don't render anything
  if (!isOpen) return null;
  
  // Determine modal size CSS class
  const sizeClass = {
    small: 'modal-sm',
    medium: '',
    large: 'modal-lg',
    xlarge: 'modal-xl'
  }[size];
  
  // Determine header style based on type
  const headerClass = {
    info: 'bg-info text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning',
    danger: 'bg-danger text-white',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    dark: 'bg-dark text-white',
    light: 'bg-light'
  }[type] || '';
  
  // Determine confirm button style based on type
  const confirmButtonClass = {
    info: 'btn-info',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    dark: 'btn-dark',
    light: 'btn-light'
  }[type] || 'btn-primary';
  
  return (
    <div 
      className={`modal ${isVisible ? 'show d-block' : 'd-block'}`} 
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.3s ease'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className={`modal-dialog ${sizeClass} modal-dialog-centered`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-50px)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease'
        }}
      >
        <div className={`modal-content ${darkMode ? 'bg-dark text-light' : ''}`}>
          {title && (
            <div className={`modal-header ${headerClass}`}>
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
          )}
          
          <div className="modal-body">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
          
          {!hideFooter && (
            <div className="modal-footer">
              {cancelText && (
                <button
                  type="button"
                  className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                  onClick={handleClose}
                >
                  {cancelText}
                </button>
              )}
              {confirmText && (
                <button
                  type="button"
                  className={`btn ${confirmButtonClass}`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'primary', 'secondary', 'dark', 'light']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  closeOnOutsideClick: PropTypes.bool,
  hideFooter: PropTypes.bool
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Modal);