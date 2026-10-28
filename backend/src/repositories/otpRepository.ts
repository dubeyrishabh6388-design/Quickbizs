import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export class OtpRepository {
  async create(data: {
    email?: string;
    phone?: string;
    code: string;
    type: string;
    expiresAt: Date;
  }) {
    const encEmail = data.email ? encryptDbField(data.email) : null;
    const encPhone = data.phone ? encryptDbField(data.phone) : null;

    return prisma.otp.create({
      data: {
        email: encEmail || data.email || null,
        phone: encPhone || data.phone || null,
        code: data.code,
        type: data.type,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findLatest(identifier: string, type: string) {
    const isEmail = identifier.includes("@");
    const encIdent = encryptDbField(identifier) || identifier;

    return prisma.otp.findFirst({
      where: isEmail
        ? {
            type,
            OR: [{ email: identifier }, { email: encIdent }],
          }
        : {
            type,
            OR: [{ phone: identifier }, { phone: encIdent }],
          },
      orderBy: { createdAt: "desc" },
    });
  }

  async countRecentSends(identifier: string, minutes: number) {
    const timeLimit = new Date(Date.now() - minutes * 60 * 1000);
    const isEmail = identifier.includes("@");
    const encIdent = encryptDbField(identifier) || identifier;

    return prisma.otp.count({
      where: isEmail
        ? {
            createdAt: { gte: timeLimit },
            OR: [{ email: identifier }, { email: encIdent }],
          }
        : {
            createdAt: { gte: timeLimit },
            OR: [{ phone: identifier }, { phone: encIdent }],
          },
    });
  }
}
