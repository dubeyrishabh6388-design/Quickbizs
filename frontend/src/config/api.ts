import axios from "axios";
import { env } from "./env";
import { encryptData, decryptData, isEncryptedEnvelope } from "../utils/cryptoPayload";

export const api = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token & encrypt outgoing JSON payload
api.interceptors.request.use(
  (config) => {
    // 1. Attach authorization token if present
    const token = localStorage.getItem("qb_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Encrypt request body if payload encryption is enabled
    if (env.encryptionEnabled && config.data) {
      // Do not encrypt FormData (file uploads), Blobs, or already encrypted payloads
      const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
      const isBlob = typeof Blob !== "undefined" && config.data instanceof Blob;
      const isAlreadyEncrypted = isEncryptedEnvelope(config.data);
      const isSkipRequested = config.headers?.["X-Skip-Encryption"] === "true";

      if (!isFormData && !isBlob && !isAlreadyEncrypted && !isSkipRequested) {
        try {
          const cipherText = encryptData(config.data);
          config.data = {
            __encrypted: true,
            payload: cipherText,
          };
          if (config.headers) {
            config.headers["X-Payload-Encrypted"] = "true";
          }
        } catch (err) {
          console.warn("[Crypto] Skipping request payload encryption due to error:", err);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401 & decrypt incoming encrypted payloads
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
  (response) => {
    // Transparently decrypt response data if encrypted
    if (response?.data && isEncryptedEnvelope(response.data)) {
      try {
        response.data = decryptData(response.data.payload);
      } catch (err) {
        console.error("[Crypto] Failed to decrypt response data:", err);
      }
    }
    return response;
  },
  async (error) => {
    // Decrypt error response data if encrypted so UI error handlers receive readable messages
    if (error.response?.data && isEncryptedEnvelope(error.response.data)) {
      try {
        error.response.data = decryptData(error.response.data.payload);
      } catch (err) {
        console.error("[Crypto] Failed to decrypt error response payload:", err);
      }
    }

    const originalRequest = error.config;

    // Avoid infinite loop if auth/login or auth/verify fails
    if (originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/otp")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
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
        const payloadData = env.encryptionEnabled
          ? { __encrypted: true, payload: encryptData({ refreshToken }) }
          : { refreshToken };

        const response = await axios.post(`${env.apiUrl}/api/v1/auth/refresh`, payloadData, {
          headers: {
            "Content-Type": "application/json",
            ...(env.encryptionEnabled ? { "X-Payload-Encrypted": "true" } : {}),
          },
        });

        let data = response.data;
        if (isEncryptedEnvelope(data)) {
          data = decryptData(data.payload);
        }

        if (data?.success && data?.data) {
          const { accessToken, refreshToken: newRefreshToken } = data.data;
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
      } catch (refreshError: any) {
        if (refreshError.response?.data && isEncryptedEnvelope(refreshError.response.data)) {
          try {
            refreshError.response.data = decryptData(refreshError.response.data.payload);
          } catch {
            // ignore
          }
        }
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
