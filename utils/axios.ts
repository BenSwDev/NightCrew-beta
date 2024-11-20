// utils/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/", // Adjust if your API routes are under a different base path
  withCredentials: true, // Ensures cookies are sent with each request
});

export default axiosInstance;
