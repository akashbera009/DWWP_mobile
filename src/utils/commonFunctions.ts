import mmkvStorage from "./mmkvStorage";

const USER_KEY = "APP_USER";

export type StoredUser = {
  uid: string;
  email: string;
};

export const saveUser = async (uid: string, email: string) => {
  const user: StoredUser = { uid, email };

  await mmkvStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};
export const getStoredUser = async (): Promise<StoredUser | null> => {
  const user = await mmkvStorage.getItem(USER_KEY);

  if (!user) return null;

  return JSON.parse(user);
};
export const removeStoredUser = async () => {
  await mmkvStorage.removeItem(USER_KEY);
};