import colors from "@dwwp/utils/colors";
import { screenNames } from "@dwwp/utils/screenNames";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { FirebaseAuthTypes, getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth";
import mmkvStorage from "@dwwp/utils/mmkvStorage";
import { navigationRef } from "@dwwp/utils/navigationService";

import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)

  const [loading, setLoading] = useState<boolean>(false)
  const handleLogin = async () => {
    console.log('initiating login');
    setLoading(true)
    try {
      const res = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      const resUser = res.user;
      console.log('user resposne ', resUser);

      if (resUser) {
        setUser(resUser);

        // store in MMKV
        const userEmail = resUser.email ?? "";
        if (userEmail !== "") {
          await mmkvStorage.setItem("USER_EMAIL", userEmail);
          await mmkvStorage.setItem("USER_UID", resUser.uid);
        }

        // navigation.getParent()?.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{ name: 'MainStack' }],
        //   })
        // );
        // navigation.navigate(screenNames.MainStack,{
        //   screen: screenNames.DashBoard,
        // });
        console.log("User logged in:", resUser.email);
      } else {
        console.log("Login failed: No user returned");
      }
    } catch (e) {
      console.error("Login error:", e);
    } finally {
      console.log('login process completed');
      setLoading(false)
    }
  };
  const handleGotoSignUpScreen = () => {
    // navigation.navigate(screenNames.SignUpScreen)
  }
  const handleSkip = () => {
    navigationRef?.current?.reset({
      index: 0,
      routes: [
        {
          name: 'MainStack',
          state: {
            routes: [
              {
                name: 'BottomTabs',
                state: {
                  routes: [{ name: 'DashBoard' }],
                },
              },
            ],
          },
        },
      ],
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={showPassword}
      />

      <TouchableOpacity style={styles.button}
        onPress={handleLogin}>
        {!loading ?
          <Text style={styles.buttonText}>Sign In</Text>
          :
          <ActivityIndicator size='small' color={colors.white} />
        }
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGotoSignUpScreen}
      >
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSkip}
      >
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: 12,
  },
  skip: {
    textAlign: "center",
    color: "gray",
  },
});