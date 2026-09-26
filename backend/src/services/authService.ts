import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { UserRepository } from "../repositories/userRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { PwaCustomerRepository } from "../repositories/pwaCustomerRepository";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const pwaCustomerRepository = new PwaCustomerRepository();

export class AuthService {
  async register(data: {
    email: string;
    name: string;
    passwordHash: string;
    businessName: string;
    roleName: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const err: any = new Error("User email is already registered.");
      err.statusCode = 400;
      err.problem = "Duplicate user email registration.";
      err.reason = "A user account with this email address already exists.";
      err.solution = "Please log in with your existing account or use a different email.";
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.passwordHash, salt);

    // Run business creation and default role seeding in a Database Transaction (Step 10 / Section 2)
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name: data.businessName,
        },
      });

      // 2. Seed default roles for this business
      const rolesToCreate = ["Owner", "Cashier", "Accountant", "Warehouse", "SuperAdmin"];
      const createdRoles = await Promise.all(
        rolesToCreate.map((r) =>
          tx.role.create({
            data: {
              businessId: business.id,
              name: r,
            },
          })
        )
      );

      // Find the specific role requested (fallback to Owner)
      const targetRole = createdRoles.find((r) => r.name === data.roleName) || createdRoles[0];

      // 3. Create User
      const user = await tx.user.create({
        data: {
          businessId: business.id,
          name: data.name,
          email: data.email,
          passwordHash: hash,
        },
      });

      // 4. Map user to role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: targetRole.id,
        },
      });

      return { user, business, role: targetRole };
    });

    // 5. Generate session tokens
    const accessToken = generateAccessToken(result.user.id, result.business.id, result.role.name);
    const refreshToken = generateRefreshToken(result.user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await userRepository.createSession(result.user.id, accessToken, refreshToken, expiresAt);

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.role.name,
        businessId: result.business.id,
        businessName: result.business.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; passwordHash: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      const err: any = new Error("Invalid email or password.");
      err.statusCode = 401;
      err.problem = "Authentication check failed.";
      err.reason = "No matching user credentials found.";
      err.solution = "Please verify your email and password entry.";
      throw err;
    }

    const isMatch = await bcrypt.compare(data.passwordHash, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Invalid email or password.");
      err.statusCode = 401;
      err.problem = "Authentication check failed.";
      err.reason = "Password entry does not match database record.";
      err.solution = "Please verify your password and retry.";
      throw err;
    }

    const activeRole = user.roles[0]?.role.name || "Owner";

    const accessToken = generateAccessToken(user.id, user.businessId, activeRole);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(user.id, accessToken, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: activeRole,
        businessId: user.businessId,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const session = await userRepository.findSession(token);
    if (!session || new Date() > session.expiresAt) {
      const err: any = new Error("Session expired or invalid.");
      err.statusCode = 401;
      err.problem = "Session refresh failed.";
      err.reason = "Refresh token is invalid or has expired.";
      err.solution = "Please log in again to establish a new session.";
      throw err;
    }

    let user: any;
    let isCustomer = false;
    let activeRole = "Customer";
    let businessId: string | undefined = undefined;

    if (session.userId) {
      user = await userRepository.findById(session.userId);
      if (!user) {
        const err: any = new Error("User account not found.");
        err.statusCode = 404;
        throw err;
      }
      activeRole = user.roles[0]?.role.name || "Owner";
      businessId = user.businessId;
    } else if (session.customerId) {
      user = await pwaCustomerRepository.findById(session.customerId);
      if (!user) {
        const err: any = new Error("Customer account not found.");
        err.statusCode = 404;
        throw err;
      }
      isCustomer = true;
    } else {
      const err: any = new Error("Invalid session mapping.");
      err.statusCode = 400;
      throw err;
    }

    // Revoke old session (soft invalidation)
    await userRepository.revokeSession(session.id);

    const accessToken = generateAccessToken(user.id, businessId, activeRole);
    const newRefreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(user.id, accessToken, newRefreshToken, expiresAt, isCustomer);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string) {
    const session = await userRepository.findSession(token);
    if (session) {
      await userRepository.revokeSession(session.id);
    }
    return { success: true, message: "Logged out successfully." };
  }

  async sendOtp(phone: string, type: "CUSTOMER" | "MERCHANT") {
    if (!phone || !phone.match(/^\+?[1-9]\d{1,14}$/)) {
      const err: any = new Error("Invalid phone number format.");
      err.statusCode = 400;
      err.problem = "Input validation failed.";
      err.reason = "Phone number must be in E.164 format.";
      err.solution = "Please enter a valid phone number (e.g. +919988776655).";
      throw err;
    }

    if (type !== "CUSTOMER" && type !== "MERCHANT") {
      const err: any = new Error("Invalid user type.");
      err.statusCode = 400;
      throw err;
    }

    // Rate Limiting checks: max 3 requests in 10 minutes
    const recentSends = await otpRepository.countRecentSends(phone, 10);
    if (recentSends >= 3) {
      const err: any = new Error("Too many OTP requests. Please wait before retrying.");
      err.statusCode = 429;
      err.problem = "Rate limit exceeded.";
      err.reason = "Maximum of 3 OTP sends within 10 minutes is allowed per phone number.";
      err.solution = "Please wait a few minutes before trying to request a new verification code.";
      throw err;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await otpRepository.create({
      phone,
      code,
      type,
      expiresAt,
    });

    console.log(`[SMS Gateway Emulator] Sent OTP code [${code}] to phone [${phone}] (Valid for 5 mins).`);

    return {
      success: true,
      message: "OTP sent successfully.",
      expiresAt,
    };
  }

  async verifyOtp(phone: string, otp: string, type: "CUSTOMER" | "MERCHANT") {
    if (!phone || !otp) {
      const err: any = new Error("Phone number and OTP code are required.");
      err.statusCode = 400;
      throw err;
    }

    const record = await otpRepository.findLatest(phone, type);
    if (!record || record.code !== otp || new Date() > record.expiresAt) {
      const err: any = new Error("Invalid or expired OTP code.");
      err.statusCode = 401;
      err.problem = "OTP check failed.";
      err.reason = "Code does not match or session has expired.";
      err.solution = "Please request a new verification code and try again.";
      throw err;
    }

    let userResponse: any;

    if (type === "CUSTOMER") {
      let pwaCustomer: any = await pwaCustomerRepository.findByPhone(phone);
      if (!pwaCustomer) {
        pwaCustomer = await pwaCustomerRepository.create({
          name: "New Customer",
          phone,
        });
      }

      const role = "Customer";
      const accessToken = generateAccessToken(pwaCustomer.id, undefined, role);
      const refreshToken = generateRefreshToken(pwaCustomer.id);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await userRepository.createSession(pwaCustomer.id, accessToken, refreshToken, expiresAt, true);

      userResponse = {
        user: {
          id: pwaCustomer.id,
          name: pwaCustomer.name,
          phone: pwaCustomer.phone,
          role,
          trustScore: pwaCustomer.trustScore?.score ?? 100,
        },
        accessToken,
        refreshToken,
      };
    } else {
      const user = await userRepository.findByPhone(phone);
      if (!user) {
        const err: any = new Error("Merchant account not registered under this phone number.");
        err.statusCode = 404;
        err.problem = "Account lookup failed.";
        err.reason = "No merchant user matches the provided phone number.";
        err.solution = "Please register your business using the web portal first.";
        throw err;
      }

      const activeRole = user.roles[0]?.role.name || "Owner";
      const accessToken = generateAccessToken(user.id, user.businessId, activeRole);
      const refreshToken = generateRefreshToken(user.id);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await userRepository.createSession(user.id, accessToken, refreshToken, expiresAt);

      userResponse = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: activeRole,
          businessId: user.businessId,
        },
        accessToken,
        refreshToken,
      };
    }

    return userResponse;
  }

  async registerMerchant(data: {
    ownerName: string;
    businessName: string;
    phone: string;
    email: string;
    address?: string;
    passwordHash: string;
  }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const err: any = new Error("User email is already registered.");
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.passwordHash, salt);

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name: data.businessName,
          phone: data.phone,
          email: data.email,
          ownerName: data.ownerName,
          address: data.address,
        },
      });

      // PART 3 — INSTRUMENT THE SAME TRANSACTION
      const createdBusinessId = business.id;
      const sameTxBusiness = await tx.business.findUnique({
        where: { id: createdBusinessId },
      });
      const txDatabase: any = await tx.$queryRaw`
        SELECT DATABASE() AS db,
               CONNECTION_ID() AS connection_id,
               @@autocommit AS autocommit
      `;

      const safe = (v: any) => JSON.stringify(v, (_, val) => (typeof val === "bigint" ? val.toString() : val));

      console.log("[REGISTRATION DEBUG]");
      console.log(`business.id = ${createdBusinessId}`);
      console.log(`sameTxBusiness.id = ${sameTxBusiness ? sameTxBusiness.id : "null"}`);
      console.log(`sameTxBusiness exists = ${!!sameTxBusiness}`);
      console.log(`tx database = ${safe(txDatabase?.[0]?.db)}`);
      console.log(`tx connection_id = ${safe(txDatabase?.[0]?.connection_id)}`);
      console.log(`tx autocommit = ${safe(txDatabase?.[0]?.autocommit)}`);

      // PART 4 — VERIFY THE PARENT ROW DIRECTLY
      const parentCheck: any = await tx.$queryRaw`
        SELECT id, name
        FROM businesses
        WHERE id = ${business.id}
      `;
      console.log(`[PARENT CHECK] rows returned = ${parentCheck.length}, exactly one = ${parentCheck.length === 1}`);

      const fkCheck: any = await tx.$queryRaw`
        SELECT
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'roles'
          AND CONSTRAINT_NAME = 'roles_business_id_fkey'
      `;
      console.log(`[FK CHECK]`, safe(fkCheck));

      // PART 7 — VERIFY DATABASE FROM THE SAME TRANSACTION
      const dbNameQuery: any = await tx.$queryRaw`SELECT DATABASE() AS database_name`;
      const countBusiness: any = await tx.$queryRaw`
        SELECT COUNT(*) AS matching_business
        FROM businesses
        WHERE id = ${business.id}
      `;
      const existingRoles: any = await tx.$queryRaw`
        SELECT id, business_id, name
        FROM roles
        WHERE business_id = ${business.id}
      `;
      console.log(`[PART 7 DIAG] database_name =`, safe(dbNameQuery));
      console.log(`[PART 7 DIAG] matching_business count =`, safe(countBusiness));
      console.log(`[PART 7 DIAG] existing_roles before role creation (should be 0) =`, safe(existingRoles));

      // PART 2, 5, 6 — SEED DEFAULT ROLES SEQUENTIALLY WITH PER-ROLE CATCH
      const rolesToCreate = ["Owner", "Cashier", "Accountant", "Warehouse", "SuperAdmin"];
      const createdRoles = [];
      for (const roleName of rolesToCreate) {
        console.log(`[ROLE DEBUG]\nroleName=${roleName}\nbusinessId=${business.id}\nbusinessIdLength=${business.id?.length}\nbusinessIdType=${typeof business.id}`);
        try {
          const roleId = crypto.randomUUID();
          let role = await tx.role.create({
            data: {
              id: roleId,
              businessId: business.id,
              name: roleName,
            },
          });
          if (!role) {
            role = { id: roleId, businessId: business.id, name: roleName };
          }
          console.log(`[ROLE SUCCESS] ${roleName} ${role.id}`);
          createdRoles.push(role);
        } catch (error) {
          console.error(`[ROLE FAILURE] ${roleName}`, error);
          throw error;
        }
      }

      const targetRole = createdRoles.find((r) => r?.name === "Owner") || createdRoles[0];

      // 3. Create User
      const userId = crypto.randomUUID();
      let user = await tx.user.create({
        data: {
          id: userId,
          businessId: business.id,
          name: data.ownerName,
          email: data.email,
          phone: data.phone,
          passwordHash: hash,
        },
      });
      if (!user) {
        user = {
          id: userId,
          businessId: business.id,
          name: data.ownerName,
          email: data.email,
          phone: data.phone,
        };
      }

      // 4. Map role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: targetRole.id,
        },
      });

      return { user, business, role: targetRole };
    });

    const accessToken = generateAccessToken(result.user.id, result.business.id, result.role.name);
    const refreshToken = generateRefreshToken(result.user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(result.user.id, accessToken, refreshToken, expiresAt);

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.role.name,
        businessId: result.business.id,
      },
      accessToken,
      refreshToken,
    };
  }

  async registerCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    passwordHash: string;
  }) {
    const existingPhone = await pwaCustomerRepository.findByPhone(data.phone);
    if (existingPhone) {
      const err: any = new Error("Phone number is already registered.");
      err.statusCode = 400;
      throw err;
    }

    if (data.email) {
      const existingEmail = await pwaCustomerRepository.findByEmail(data.email);
      if (existingEmail) {
        const err: any = new Error("Email is already registered.");
        err.statusCode = 400;
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.passwordHash, salt);

    const pwaCustomer = await pwaCustomerRepository.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      passwordHash: hash,
    });

    const role = "Customer";
    const accessToken = generateAccessToken(pwaCustomer.id, undefined, role);
    const refreshToken = generateRefreshToken(pwaCustomer.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(pwaCustomer.id, accessToken, refreshToken, expiresAt, true);

    return {
      user: {
        id: pwaCustomer.id,
        name: pwaCustomer.name,
        phone: pwaCustomer.phone,
        email: pwaCustomer.email,
        role,
        trustScore: pwaCustomer.trustScore?.score ?? 100,
      },
      accessToken,
      refreshToken,
    };
  }

  async loginMerchant(data: {
    identifier: string;
    passwordHash: string;
  }) {
    let user = await userRepository.findByEmail(data.identifier);
    if (!user) {
      user = await userRepository.findByPhone(data.identifier);
    }

    if (!user) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(data.passwordHash, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    const activeRole = user.roles[0]?.role.name || "Owner";
    const accessToken = generateAccessToken(user.id, user.businessId, activeRole);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(user.id, accessToken, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: activeRole,
        businessId: user.businessId,
      },
      accessToken,
      refreshToken,
    };
  }

  async loginCustomer(data: {
    identifier: string;
    passwordHash: string;
  }) {
    let customer = await pwaCustomerRepository.findByPhone(data.identifier);
    if (!customer && data.identifier.includes("@")) {
      customer = await pwaCustomerRepository.findByEmail(data.identifier);
    }

    if (!customer) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    if (!customer.passwordHash) {
      const err: any = new Error("Password login is not set up for this account.");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(data.passwordHash, customer.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    const role = "Customer";
    const accessToken = generateAccessToken(customer.id, undefined, role);
    const refreshToken = generateRefreshToken(customer.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createSession(customer.id, accessToken, refreshToken, expiresAt, true);

    return {
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        role,
        trustScore: customer.trustScore?.score ?? 100,
      },
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    if (!userId) {
      const err: any = new Error("User ID is required.");
      err.statusCode = 401;
      throw err;
    }

    if (!currentPass || !newPass) {
      const err: any = new Error("Current and new passwords are required.");
      err.statusCode = 400;
      throw err;
    }

    if (newPass.length < 6) {
      const err: any = new Error("New password must be at least 6 characters.");
      err.statusCode = 400;
      throw err;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error("User account not found.");
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Current password entered is incorrect.");
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPass, salt);

    await userRepository.updatePassword(userId, newHash);

    return {
      success: true,
      message: "Password changed successfully."
    };
  }
}
