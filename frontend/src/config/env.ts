const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");

export const env = {
  apiUrl: cleanApiUrl,
  appName: import.meta.env.VITE_APP_NAME || "QuickBizs",
  appEnv: import.meta.env.VITE_APP_ENV || "development",
  encryptionKey: import.meta.env.VITE_PAYLOAD_ENCRYPTION_KEY || "QuickBizs_Secure_AES256_Payload_Key_2026_Enterprise!",
  encryptionEnabled: import.meta.env.VITE_ENABLE_PAYLOAD_ENCRYPTION !== "false",
};
