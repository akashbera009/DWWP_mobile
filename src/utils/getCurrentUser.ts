import { getAuth } from "@react-native-firebase/auth";

export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};