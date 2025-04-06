import React from 'react';

/**
 * 
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const Loading = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`text-center my-4 ${className}`}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default Loading;