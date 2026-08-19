import axios from 'axios';
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const baseURL = Platform.OS === 'android'
  ? process.env.EXPO_PUBLIC_API_URL_ANDROID
  : process.env.EXPO_PUBLIC_API_URL_IOS;

const instance = axios.create({
  baseURL:baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('No se pudo leer el token de SecureStore:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;


