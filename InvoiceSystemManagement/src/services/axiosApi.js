import axios from 'axios';
import { Platform } from "react-native";

const baseURL = Platform.OS === 'android'
  ? process.env.EXPO_PUBLIC_API_URL_ANDROID
  : process.env.EXPO_PUBLIC_API_URL_IOS;

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
