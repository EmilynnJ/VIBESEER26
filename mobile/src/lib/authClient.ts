import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Web-compatible storage using localStorage
const webStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  deleteItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL as string,
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: "vibecode",
      storagePrefix: process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID as string,
      storage: Platform.OS === "web" ? webStorage : SecureStore,
    }),
  ],
});
