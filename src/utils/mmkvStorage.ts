import { createMMKV } from "react-native-mmkv";

export const mmkv = createMMKV();
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
      mmkv.remove(key);
      resolve();
    });
  },
};

export default mmkvStorage;