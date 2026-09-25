import { PrismaClient } from "../generated/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./environment";

const buildAdapter = (): PrismaMariaDb => {
  const databaseUrl = env.databaseUrl;

  // 1. If a full connection URI is provided, use it directly (works with cloud providers & local)
  if (databaseUrl && (databaseUrl.startsWith("mysql://") || databaseUrl.startsWith("mariadb://"))) {
    return new PrismaMariaDb(databaseUrl);
  }

  // 2. Decomposed database credentials support (Render / Cloud / Local)
  const host = env.dbHost || "127.0.0.1";
  const port = env.dbPort || 3306;
  const user = env.dbUser || "root";
  const password = env.dbPassword || "";
  const database = env.dbName || "quickbiz";
  const ssl = env.dbSsl ? { rejectUnauthorized: false } : undefined;

  return new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    ssl,
    connectionLimit: env.dbConnectionLimit || 10,
  });
};

const adapter = buildAdapter();
export const prisma = new PrismaClient({ adapter });

