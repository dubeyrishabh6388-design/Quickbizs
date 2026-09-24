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
}

const requiredEnvKeys = ["DATABASE_URL", "JWT_SECRET"];
const missingKeys: string[] = [];

requiredEnvKeys.forEach((key) => {
  if (!process.env[key]) {
    missingKeys.push(key);
  }
});

if (missingKeys.length > 0) {
  throw new Error(
    `Configuration Error: Missing required environment keys: ${missingKeys.join(", ")}. Please configure them in your .env file.`
  );
}

export const env: Environment = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
