import { useState, useEffect } from 'react';
import CustomToast from './CustomToast';

export const ToastContainer = () => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Subscribe to toast updates and track message changes
    const interval = setInterval(() => {
      if (CustomToast.isToastVisible()) {
        const message = CustomToast.getCurrentMessage();
        if (message !== currentMessage) {
          setCurrentMessage(message);
        }
      } else if (currentMessage !== '') {
        setCurrentMessage('');
      }
    }, 16); // 60fps update rate for smooth animations

    return () => clearInterval(interval);
  }, [currentMessage]);

  // Get the current toast element
  const currentToast = CustomToast.getToast();

  // Only render if there's a visible toast
  if (!currentToast || !CustomToast.isToastVisible()) {
    return null;
  }

  return currentToast;
};