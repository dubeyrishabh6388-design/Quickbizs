import crypto from "crypto";
import { prisma } from "../config/prisma";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findByPhone(phone: string) {
    return prisma.user.findFirst({
      where: { phone, isDeleted: false },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    expiresAt: Date,
    isCustomer: boolean = false
  ) {
    try {
      return await prisma.session.create({
        data: {
          userId: isCustomer ? null : userId,
          customerId: isCustomer ? userId : null,
          token,
          refreshToken,
          expiresAt,
        },
      });
    } catch (sessionErr: any) {
      if (sessionErr?.message?.includes("customer_id") || sessionErr?.code === "P2022") {
        const sessionId = crypto.randomUUID();
        await prisma.$executeRawUnsafe(
          `INSERT INTO sessions (id, user_id, token, refresh_token, expires_at, is_revoked, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(3), NOW(3))`,
          sessionId,
          isCustomer ? null : userId,
          token,
          refreshToken,
          expiresAt
        );
        return {
          id: sessionId,
          userId: isCustomer ? null : userId,
          token,
          refreshToken,
          expiresAt,
          isRevoked: false,
        };
      }
      throw sessionErr;
    }
  }

  async findSession(refreshToken: string) {
    return prisma.session.findFirst({
      where: { refreshToken, isRevoked: false },
    });
  }

  async revokeSession(id: string) {
    return prisma.session.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
