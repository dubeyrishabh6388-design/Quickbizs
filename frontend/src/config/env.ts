const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");

export const env = {
  apiUrl: cleanApiUrl,
  appName: import.meta.env.VITE_APP_NAME || "QuickBizs",
  appEnv: import.meta.env.VITE_APP_ENV || "development",
};
