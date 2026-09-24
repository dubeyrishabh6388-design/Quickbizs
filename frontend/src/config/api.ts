import axios from "axios";
import { env } from "./env";

export const api = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qb_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if auth/login or auth/verify fails
    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/otp")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("qb_refresh_token");
      if (!refreshToken) {
        handleLogoutAction();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${env.apiUrl}/api/v1/auth/refresh`, {
          refreshToken,
        });

        if (response.data?.success && response.data?.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem("qb_token", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("qb_refresh_token", newRefreshToken);
          }

          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogoutAction();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleLogoutAction() {
  localStorage.removeItem("qb_token");
  localStorage.removeItem("qb_refresh_token");
  localStorage.removeItem("qb_user");
  window.dispatchEvent(new Event("auth-logout"));
}
