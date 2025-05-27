// apiClient.js
import axios from 'axios';
const BASE_URL = 'http://localhost:8080/lbf'; // ajusta la URL

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
