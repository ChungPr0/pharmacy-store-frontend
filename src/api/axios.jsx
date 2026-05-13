import axios from "axios";
import { API_CONFIG } from "./config";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
});

// Gắn token tự động
api.interceptors.request.use((config) => {
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
api.interceptors.response.use(
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
          return api(originalRequest);
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
        
        toast.error("Vui lòng đăng nhập để tiếp tục!", { duration: 3000 });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        
        return Promise.reject(error);
      }

      try {
        // Gọi refresh-token endpoint (không dùng `api` để tránh infinite loop interceptor)
        const response = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh-token`,
          { refreshToken },
          { timeout: API_CONFIG.timeout }
        );

        if (response.data.status === 200) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken || refreshToken;

          // Cập nhật token
          localStorage.setItem('token', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          // Xử lý hàng chờ
          processQueue(null, newAccessToken);

          // Retry request cũ với token mới
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu API trả về 403 Forbidden hoặc lỗi khác
        if (refreshError.response?.status === 403 || refreshError.response?.status === 400 || refreshError.response?.status === 401) {
          // Xóa data và redirect login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", { duration: 3000 });
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;