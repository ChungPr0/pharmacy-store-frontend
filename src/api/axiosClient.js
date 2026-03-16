// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000', // Khớp với port của json-server
  headers: { 'Content-Type': 'application/json' }
});

export default axiosClient;