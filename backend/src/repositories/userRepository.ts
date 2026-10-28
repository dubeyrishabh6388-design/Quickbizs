import crypto from "crypto";
import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export function decryptUser<T extends { email?: string | null; phone?: string | null; name?: string | null } | null>(user: T): T {
  if (!user) return user;
  return {
    ...user,
    email: user.email ? (decryptDbField(user.email) as string) : user.email,
    phone: user.phone ? (decryptDbField(user.phone) as string) : user.phone,
    name: user.name ? (decryptDbField(user.name) as string) : user.name,
  };
}

export class UserRepository {
  async findByEmail(email: string) {
    const encEmail = encryptDbField(email) || email;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { email: encEmail }],
      },
      include: {
        business: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return decryptUser(user);
  }

  async findByPhone(phone: string) {
    const encPhone = encryptDbField(phone) || phone;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { phone: encPhone }],
        isDeleted: false,
      },
      include: {
        business: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return decryptUser(user);
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        business: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return decryptUser(user);
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
