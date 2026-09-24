import { prisma } from "../config/prisma";

export class OtpRepository {
  async create(data: { phone: string; code: string; type: string; expiresAt: Date }) {
    return prisma.otp.create({
      data,
    });
  }

  async findLatest(phone: string, type: string) {
    return prisma.otp.findFirst({
      where: { phone, type },
      orderBy: { createdAt: "desc" },
    });
  }

  async countRecentSends(phone: string, minutes: number) {
    const timeLimit = new Date(Date.now() - minutes * 60 * 1000);
    return prisma.otp.count({
      where: {
        phone,
        createdAt: { gte: timeLimit },
      },
    });
  }
}
