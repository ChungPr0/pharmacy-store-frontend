// src/api/authAxios.js
import axios from 'axios';
import { API_CONFIG } from './config';

// Axios instance cho auth API (không cần token)
const authAxios = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_CONFIG.timeout,
});

export default authAxios;
