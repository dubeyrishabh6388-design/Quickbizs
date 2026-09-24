import { PrismaClient } from "../generated/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbUrl = process.env.DATABASE_URL || "";
const portMatch = dbUrl.match(/:(\d+)\//);
const dbPort = portMatch ? parseInt(portMatch[1], 10) : 3307;

const adapter = new PrismaMariaDb({
  host: "127.0.0.1",
  port: dbPort,
  user: "root",
  password: "",
  database: "quickbiz",
  connectionLimit: 20,
});

export const prisma = new PrismaClient({ adapter });
