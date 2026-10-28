import dotenv from "dotenv";
import path from "path";

// Load env variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

export interface Environment {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  frontendUrl: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;
  dbSsl?: boolean;
  dbConnectionLimit?: number;
  groqApiKey?: string;
  groqModel?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpFromName: string;
  payloadEncryptionKey: string;
  payloadEncryptionEnabled: boolean;
}

// Ensure database configuration exists (either DATABASE_URL or decomposed DB variables)
let resolvedDatabaseUrl = process.env.DATABASE_URL;

if (!resolvedDatabaseUrl) {
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;
  if (host && dbName) {
    const user = encodeURIComponent(process.env.DB_USER || "root");
    const password = encodeURIComponent(process.env.DB_PASSWORD || "");
    const port = process.env.DB_PORT || "3306";
    resolvedDatabaseUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
  }
}

const missingKeys: string[] = [];
if (!resolvedDatabaseUrl) {
  missingKeys.push("DATABASE_URL (or DB_HOST + DB_NAME)");
}
if (!process.env.JWT_SECRET) {
  missingKeys.push("JWT_SECRET");
}

if (missingKeys.length > 0) {
  throw new Error(
    `Configuration Error: Missing required environment keys: ${missingKeys.join(", ")}. Please configure them in your environment or .env file.`
  );
}

export const env: Environment = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: resolvedDatabaseUrl!,
  jwtSecret: process.env.JWT_SECRET!,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbSsl: process.env.DB_SSL === "true",
  dbConnectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  smtpHost: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "c0514a001@smtp-brevo.com",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || "c0514a001@smtp-brevo.com",
  smtpFromName: process.env.SMTP_FROM_NAME || "QuickBizs",
  payloadEncryptionKey: process.env.PAYLOAD_ENCRYPTION_KEY || "QuickBizs_Secure_AES256_Payload_Key_2026_Enterprise!",
  payloadEncryptionEnabled: process.env.ENABLE_PAYLOAD_ENCRYPTION !== "false",
};

/**
 * Returns an array of allowed origins for CORS validation in both development and production.
 */
export const getAllowedOrigins = (): (string | RegExp)[] => {
  const origins: (string | RegExp)[] = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://quickbizs.com",
    /\.onrender\.com$/,
  ];

  if (process.env.FRONTEND_URL) {
    const urls = process.env.FRONTEND_URL.split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    urls.forEach((url) => {
      if (!origins.includes(url)) {
        origins.push(url);
      }
    });
  }

  return origins;
};
