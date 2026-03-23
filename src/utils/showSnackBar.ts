import CustomToast from '@dwwp/components/CustomToast';
import colors from '@dwwp/utils/colors';

export interface SnackbarOptions {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const showSnackbar = ({
  message,
  duration = 3000,
  type = 'info',
}: SnackbarOptions) => {
  let backgroundColor = colors.black;
  let textColor = colors.white;
  let icon: 'tick' | 'error' | 'warning' | 'info' = 'info';
  let position: 'top' | 'bottom' = 'top';

  switch (type) {
    case 'success':
      backgroundColor = '#E2F6EC';
      textColor = colors.neutralBlack;
      icon = 'tick';
      position = 'top'; // All toasts from top
      break;
    case 'error':
      backgroundColor = colors.errorBackground;
      textColor = colors.white;
      icon = 'error';
      position = 'top';
      break;
    case 'warning':
      backgroundColor = colors.warningBackground;
      textColor = colors.black;
      icon = 'warning';
      position = 'top';
      break;
    case 'info':
    default:
      backgroundColor = colors.infoBackground;
      textColor = colors.black;
      icon = 'info';
      position = 'top';
      break;
  }

  CustomToast.show({
    message,
    duration,
    backgroundColor,
    textColor,
    icon,
    position,
  });
};

// Convenience functions for different types
export const showSuccessSnackbar = (message: string, duration?: number) => {
  showSnackbar({ message, duration, type: 'success' });
};

export const showErrorSnackbar = (message: string, duration?: number) => {
  showSnackbar({ message, duration, type: 'error' });
};

export const showWarningSnackbar = (message: string, duration?: number) => {
  showSnackbar({ message, duration, type: 'warning' });
};

export const showInfoSnackbar = (message: string, duration?: number) => {
  showSnackbar({ message, duration, type: 'info' });
};
