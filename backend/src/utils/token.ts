import jwt from "jsonwebtoken";
import { env } from "../config/environment";

export interface TokenPayload {
  userId: string;
  businessId?: string;
  role: string;
}

export const generateAccessToken = (
  userId: string,
  businessId: string | undefined,
  role: string
): string => {
  return jwt.sign({ userId, businessId, role }, env.jwtSecret, {
    expiresIn: "24h",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
};
