import { MMKV } from 'react-native-mmkv';

// Create MMKV instance
const mmkv = new MMKV();

// Storage adapter for redux-persist
export const mmkvStorage = {
  setItem: (key: string, value: string): Promise<void> => {
    return new Promise(resolve => {
      mmkv.set(key, value);
      resolve();
    });
  },

  getItem: (key: string): Promise<string | null> => {
    return new Promise(resolve => {
      const value = mmkv.getString(key);
      resolve(value || null);
    });
  },

  removeItem: (key: string): Promise<void> => {
    return new Promise(resolve => {
      mmkv.delete(key);
      resolve();
    });
  },
};

export const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export const markOnboardingCompleted = () => {
  mmkv.set(ONBOARDING_COMPLETED_KEY, 'true');
};

export const isOnboardingCompleted = (): boolean => {
  return mmkv.getBoolean(ONBOARDING_COMPLETED_KEY) || false;
};

export const resetOnboarding = () => {
  mmkv.delete(ONBOARDING_COMPLETED_KEY);
};

export default mmkvStorage;