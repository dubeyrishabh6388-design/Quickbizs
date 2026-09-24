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
    return prisma.session.create({
      data: {
        userId: isCustomer ? null : userId,
        customerId: isCustomer ? userId : null,
        token,
        refreshToken,
        expiresAt,
      },
    });
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
