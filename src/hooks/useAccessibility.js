import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing focus trapping within a component
 * Useful for modals, dropdowns, etc.
 * @param {boolean} isActive - Whether focus trapping is active
 * @param {React.RefObject} containerRef - Ref to the container element
 * @returns {Object} Object with focus management methods
 */
export const useFocusTrap = (isActive = true, containerRef = null) => {
  const ref = containerRef || useRef(null);
  const previousFocusRef = useRef(null);
  
  /**
   * Find all focusable elements within the container
   */
  const getFocusableElements = useCallback(() => {
    if (!ref.current) return [];
    
    return Array.from(
      ref.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, [ref]);
  
  /**
   * Focus the first focusable element in the container
   */
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (ref.current) {
      ref.current.focus();
    }
  }, [getFocusableElements, ref]);
  
  /**
   * Handle tab key to keep focus within the container
   */
  const handleTabKey = useCallback((e) => {
    if (!isActive || !ref.current) return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab on first element, move to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // If tab on last element, move to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [isActive, getFocusableElements, ref]);
  
  // Set up event listener for keydown events
  useEffect(() => {
    if (!isActive) return;
    
    // Store the previously focused element
    previousFocusRef.current = document.activeElement;
    
    // Focus the first element when trap becomes active
    focusFirstElement();
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        handleTabKey(e);
      } else if (e.key === 'Escape' && ref.current) {
        // Allow component to handle ESC key
        const event = new CustomEvent('accessibility-escape', { bubbles: true });
        ref.current.dispatchEvent(event);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when trap is deactivated
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, focusFirstElement, handleTabKey, ref]);
  
  return {
    ref,
    focusFirstElement,
    getFocusableElements
  };
};

/**
 * Hook for managing keyboard accessibility for components like dropdowns
 * @param {Function} onOpen - Function to call when component should open
 * @param {Function} onClose - Function to call when component should close
 * @param {Function} onSelect - Function to call when an item is selected
 * @returns {Object} Object with keyboard event handlers
 */
export const useKeyboardAccessibility = (onOpen, onClose, onSelect) => {
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (onOpen) onOpen();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (onOpen) onOpen();
        break;
      case 'Escape':
        e.preventDefault();
        if (onClose) onClose();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) onSelect();
        break;
      default:
        break;
    }
  }, [onOpen, onClose, onSelect]);
  
  return { handleKeyDown };
};

/**
 * Hook for adding screen reader announcements
 * @returns {Function} Function to announce messages to screen readers
 */
export const useAnnounce = () => {
  // Create or get the live region on first render
  useEffect(() => {
    let liveRegion = document.getElementById('accessibility-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    
    return () => {
      // Don't remove the live region on unmount
      // It should persist for the whole application lifecycle
    };
  }, []);
  
  // Function to announce messages
  const announce = useCallback((message, priority = 'polite') => {
    const liveRegion = document.getElementById('accessibility-live-region');
    if (!liveRegion) return;
    
    // Set the priority (assertive for important messages)
    liveRegion.setAttribute('aria-live', priority);
    
    // Clear the region first (this helps screen readers announce again)
    liveRegion.textContent = '';
    
    // Set the message after a small delay
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 50);
  }, []);
  
  return announce;
};

/**
 * Combined hook that provides various accessibility utilities
 * @returns {Object} Object with all accessibility utilities
 */
export const useAccessibility = () => {
  const announce = useAnnounce();
  
  return {
    useFocusTrap,
    useKeyboardAccessibility,
    announce
  };
};

export default useAccessibility;