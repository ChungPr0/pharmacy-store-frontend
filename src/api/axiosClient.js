// src/api/axiosClient.js
import axios from 'axios';
import { API_CONFIG } from './config';

const axiosClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_CONFIG.timeout,
});

// Request Interceptor - Gắn token vào headers
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Biến lưu trạng thái để tránh gọi refresh-token nhiều lần
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Response Interceptor - Xử lý lỗi 401 và refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh, đứng vào hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // Không có refreshToken, redirect login
        processQueue(new Error('Refresh Token not found'), null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi refresh-token endpoint
        const response = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh-token`,
          { refreshToken },
          { timeout: API_CONFIG.timeout }
        );

        if (response.data.status === 200) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken;

          // Cập nhật token
          localStorage.setItem('token', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          // Xử lý hàng chờ
          processQueue(null, newAccessToken);

          // Retry request cũ với token mới
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token hết hạn (403 Forbidden)
        if (refreshError.response?.status === 403) {
          // Xóa data và redirect login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;