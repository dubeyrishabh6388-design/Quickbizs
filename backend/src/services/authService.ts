import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { UserRepository } from "../repositories/userRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { PwaCustomerRepository } from "../repositories/pwaCustomerRepository";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { BUSINESS_TEMPLATES } from "../config/templates";
import { mailService } from "./mailService";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

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
      const err: any = new Error("This email address is already registered. Please sign in or use a different email.");
      err.statusCode = 409;
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
          name: encryptDbField(data.name) || data.name,
          email: encryptDbField(data.email) || data.email,
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

  async ensureAdminUser() {
    try {
      const adminEmail = "admin@quickbizs.com";
      const adminPlainPassword = "Rishi24103";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPlainPassword, salt);

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: adminEmail },
            { email: encryptDbField(adminEmail) || adminEmail },
            { email: "admin" }
          ]
        },
        include: {
          roles: { include: { role: true } }
        }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isActive: true,
            isDeleted: false,
          }
        });
        if (!user.passwordHash) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hash }
          });
        }

        const hasSuperAdmin = user.roles.some((ur) => ur.role?.name === "SuperAdmin");
        if (!hasSuperAdmin) {
          let role = await prisma.role.findFirst({
            where: {
              businessId: user.businessId,
              name: "SuperAdmin"
            }
          });
          if (!role) {
            role = await prisma.role.create({
              data: {
                id: crypto.randomUUID(),
                businessId: user.businessId,
                name: "SuperAdmin"
              }
            });
          }
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: role.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              roleId: role.id
            }
          });
        }
        console.log(`[Admin Seed] Master admin verified: ${user.email} (Role: SuperAdmin)`);
        return;
      }

      let business = await prisma.business.findFirst({
        orderBy: { createdAt: "asc" }
      });

      if (!business) {
        business = await prisma.business.create({
          data: {
            id: crypto.randomUUID(),
            name: "QuickBizs System Platform",
            plan: "Enterprise",
            status: "Active",
          }
        });
      }

      let superAdminRole = await prisma.role.findFirst({
        where: {
          businessId: business.id,
          name: "SuperAdmin"
        }
      });

      if (!superAdminRole) {
        superAdminRole = await prisma.role.create({
          data: {
            id: crypto.randomUUID(),
            businessId: business.id,
            name: "SuperAdmin"
          }
        });
      }

      const newAdmin = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          businessId: business.id,
          name: encryptDbField("Administrator") || "Administrator",
          email: encryptDbField(adminEmail) || adminEmail,
          passwordHash: hash,
          isActive: true,
          isDeleted: false,
        }
      });

      await prisma.userRole.create({
        data: {
          userId: newAdmin.id,
          roleId: superAdminRole.id
        }
      });

      console.log(`[Admin Seed] Master admin seeded successfully: ${adminEmail} (Role: SuperAdmin)`);
    } catch (err) {
      console.error("[Admin Seed] Error ensuring admin user:", err);
    }
  }

  async login(data: { email: string; passwordHash: string }) {
    const inputClean = data.email.trim();
    let user = await userRepository.findByEmail(inputClean);
    if (!user && (inputClean.toLowerCase() === "admin" || inputClean.toLowerCase() === "admin@quickbizs.com")) {
      user = (await userRepository.findByEmail("admin@quickbizs.com")) || (await userRepository.findByEmail("admin"));
    }
    if (!user) {
      user = await userRepository.findByPhone(inputClean);
    }
    if (!user) {
      const err: any = new Error("Invalid email or password.");
      err.statusCode = 401;
      err.problem = "Authentication check failed.";
      err.reason = "No matching user credentials found.";
      err.solution = "Please verify your email and password entry.";
      throw err;
    }

    if (user.isActive === false || user.isDeleted === true) {
      const err: any = new Error("Account is suspended or inactive. Please contact administrator.");
      err.statusCode = 403;
      throw err;
    }

    const rawPassword = data.passwordHash || (data as any).password;
    const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Invalid email or password.");
      err.statusCode = 401;
      err.problem = "Authentication check failed.";
      err.reason = "Password entry does not match database record.";
      err.solution = "Please verify your password and retry.";
      throw err;
    }

    const activeRole = user.roles.find((r: any) => r.role?.name === "SuperAdmin")?.role?.name || user.roles[0]?.role?.name || "Owner";

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
        businessName: (user as any).business?.name || (user as any).businessName,
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

  async sendOtp(identifier: string, type: "CUSTOMER" | "MERCHANT" | "LOGIN" | "REGISTER" | string) {
    const clean = (identifier || "").trim();
    if (!clean) {
      const err: any = new Error("Email address or phone number is required.");
      err.statusCode = 400;
      err.problem = "Input validation failed.";
      err.reason = "Identifier parameter cannot be empty.";
      err.solution = "Please enter your email or mobile phone number.";
      throw err;
    }

    const isEmail = clean.includes("@");
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clean)) {
        const err: any = new Error("Invalid email address format.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Email address must follow standard user@domain.com syntax.";
        err.solution = "Please double check your email spelling.";
        throw err;
      }
    } else {
      if (!clean.match(/^\+?[1-9]\d{1,14}$/)) {
        const err: any = new Error("Invalid phone number format.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Phone number must be in valid numeric format.";
        err.solution = "Please enter a valid phone number (e.g. +919988776655).";
        throw err;
      }
    }

    // Rate Limiting checks: max 5 requests in 10 minutes
    const recentSends = await otpRepository.countRecentSends(clean, 10);
    if (recentSends >= 5) {
      const err: any = new Error("Too many OTP requests. Please wait before retrying.");
      err.statusCode = 429;
      err.problem = "Rate limit exceeded.";
      err.reason = "Maximum of 5 OTP sends within 10 minutes is allowed per identifier.";
      err.solution = "Please wait a few minutes before requesting a new verification code.";
      throw err;
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await otpRepository.create({
      email: isEmail ? clean : undefined,
      phone: !isEmail ? clean : clean,
      code,
      type: type || "MERCHANT",
      expiresAt,
    });

    if (isEmail) {
      await mailService.sendOtpEmail({
        to: clean,
        code,
        type,
      });
      console.log(`[Email OTP] Sent verification code [${code}] to email [${clean}] (Expires in 5m).`);
    } else {
      console.log(`[SMS Gateway Emulator] Sent OTP code [${code}] to phone [${clean}] (Expires in 5m).`);
    }

    return {
      success: true,
      message: isEmail ? `Verification code sent to ${clean}` : `OTP sent to ${clean}`,
      expiresAt,
    };
  }

  async verifyOtp(identifier: string, otp: string, type: "CUSTOMER" | "MERCHANT" | "LOGIN" | "REGISTER" | string) {
    const clean = (identifier || "").trim();
    const cleanOtp = (otp || "").trim();
    if (!clean || !cleanOtp) {
      const err: any = new Error("Identifier and OTP code are required.");
      err.statusCode = 400;
      err.problem = "Missing parameters.";
      throw err;
    }

    const record = await otpRepository.findLatest(clean, type || "MERCHANT");
    if (!record || record.code !== cleanOtp || new Date() > record.expiresAt) {
      const err: any = new Error("Invalid or expired verification code.");
      err.statusCode = 401;
      err.problem = "Verification failed.";
      err.reason = "Code does not match or has expired.";
      err.solution = "Please request a new code and try again.";
      throw err;
    }

    const isEmail = clean.includes("@");

    // If type is CUSTOMER
    if (type === "CUSTOMER") {
      let pwaCustomer: any = isEmail
        ? await pwaCustomerRepository.findByEmail(clean)
        : await pwaCustomerRepository.findByPhone(clean);

      if (!pwaCustomer) {
        pwaCustomer = await pwaCustomerRepository.create({
          name: isEmail ? clean.split("@")[0] : "New Customer",
          phone: isEmail ? clean : clean,
          email: isEmail ? clean : undefined,
        });
      }

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
        isExistingUser: true,
      };
    }

    // If type is MERCHANT or LOGIN
    const user = isEmail
      ? await userRepository.findByEmail(clean)
      : await userRepository.findByPhone(clean);

    if (user) {
      const activeRole = user.roles.find((r: any) => r.role?.name === "SuperAdmin")?.role?.name || user.roles[0]?.role?.name || "Owner";
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
          businessName: (user as any).business?.name || (user as any).businessName,
        },
        accessToken,
        refreshToken,
        isExistingUser: true,
      };
    } else {
      // User is not yet registered; OTP verified for registration!
      return {
        verified: true,
        isExistingUser: false,
        identifier: clean,
        message: "Email verified successfully. You can complete your store registration.",
      };
    }
  }

  async registerMerchant(data: {
    ownerName: string;
    businessName: string;
    phone: string;
    email: string;
    address?: string;
    passwordHash: string;
    businessType?: string;
    sellingMode?: string;
  }) {
    // 1. Proactive Email Uniqueness Check
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const err: any = new Error("This email address is already registered. Please sign in or use a different email.");
      err.statusCode = 409;
      err.problem = "Email already registered.";
      err.reason = "An account with this email address already exists in the system.";
      err.solution = "Please sign in to your store or use another email address.";
      throw err;
    }

    // 2. Proactive Mobile Number Uniqueness Check (Across Business and User records)
    const cleanPhone = (data.phone || "").trim();
    if (cleanPhone) {
      const existingBusiness = await prisma.business.findFirst({
        where: { phone: cleanPhone, isDeleted: false },
      });
      if (existingBusiness) {
        const err: any = new Error("This mobile number is already registered to a store. Please sign in or use a different mobile number.");
        err.statusCode = 409;
        err.problem = "Mobile number already registered.";
        err.reason = "A registered store already exists with this mobile number.";
        err.solution = "Please sign in with this mobile number, or register with another mobile number.";
        throw err;
      }

      const existingUserPhone = await userRepository.findByPhone(cleanPhone);
      if (existingUserPhone) {
        const err: any = new Error("This mobile number is already registered. Please sign in or use a different mobile number.");
        err.statusCode = 409;
        err.problem = "Mobile number already registered.";
        err.reason = "An account with this mobile number already exists in the system.";
        err.solution = "Please sign in to your account, or use another mobile number.";
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.passwordHash, salt);

    const bType = data.businessType || "Custom Business";
    const template = BUSINESS_TEMPLATES[bType] || BUSINESS_TEMPLATES["Custom Business"] || {
      enabledModules: ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"],
      dashboardWidgets: ["Today's Sales", "Low Stock", "Top Products"],
      defaultCategories: ["General Items", "Fast Moving"],
      customAttributes: []
    };

    const result = await prisma.$transaction(
      async (tx: any) => {
        // 1. Create Business
        const business = await tx.business.create({
          data: {
            name: data.businessName,
            phone: data.phone,
            email: encryptDbField(data.email) || data.email,
            ownerName: data.ownerName,
            address: data.address,
            businessType: bType,
          },
        });

        // 1b. Seed Business Preferences & Counter Preferences safely
        try {
          await tx.businessPreference.create({
            data: {
              businessId: business.id,
              businessType: bType,
              businessSize: "Small",
              sellOnline: false,
              visibleModules: JSON.stringify(template.enabledModules || ["dashboard", "billing", "inventory", "customers", "suppliers", "reports", "settings"]),
              dashboardLayout: JSON.stringify(template.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"]),
              productAttributes: JSON.stringify(template.customAttributes || []),
            }
          });
        } catch (prefErr) {
          console.warn("Could not seed business preferences during registration:", prefErr);
        }

        try {
          await tx.counterPreference.create({
            data: {
              businessId: business.id,
              sellingMode: data.sellingMode || "Retail Store",
              rushMode: false,
            }
          });
        } catch (cntErr) {
          console.warn("Could not seed counter preferences during registration:", cntErr);
        }

        try {
          await tx.invoiceSequence.create({
            data: {
              businessId: business.id,
              prefix: "INV",
              nextValue: 1001,
            }
          });
        } catch (seqErr) {
          console.warn("Could not seed invoice sequence:", seqErr);
        }

        // 1c. Seed default product categories for this business
        if (template.defaultCategories && template.defaultCategories.length > 0) {
          try {
            let orderIdx = 0;
            for (const catName of template.defaultCategories) {
              await tx.productCategory.create({
                data: {
                  businessId: business.id,
                  name: catName,
                  orderIndex: orderIdx++,
                }
              });
            }
          } catch (catErr) {
            console.warn("Could not seed default categories:", catErr);
          }
        }

        // 2. Seed default roles sequentially
        const rolesToCreate = ["Owner", "Cashier", "Accountant", "Warehouse", "SuperAdmin"];
        const createdRoles = [];
        for (const roleName of rolesToCreate) {
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
          createdRoles.push(role);
        }

        const targetRole = createdRoles.find((r) => r?.name === "Owner") || createdRoles[0];

        // 3. Create User
        const userId = crypto.randomUUID();
        let user = await tx.user.create({
          data: {
            id: userId,
            businessId: business.id,
            name: data.ownerName,
            email: encryptDbField(data.email) || data.email,
            phone: data.phone,
            passwordHash: hash,
          },
        });
        if (!user) {
          user = {
            id: userId,
            businessId: business.id,
            name: data.ownerName,
            email: encryptDbField(data.email) || data.email,
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
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

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
      const err: any = new Error("This mobile number is already registered. Please sign in with your mobile number.");
      err.statusCode = 409;
      err.problem = "Mobile number already registered.";
      err.reason = "A customer account already exists with this mobile number.";
      err.solution = "Please sign in with this mobile number, or use another number.";
      throw err;
    }

    if (data.email) {
      const existingEmail = await pwaCustomerRepository.findByEmail(data.email);
      if (existingEmail) {
        const err: any = new Error("This email address is already registered. Please sign in or use a different email.");
        err.statusCode = 409;
        err.problem = "Email already registered.";
        err.reason = "A customer account already exists with this email address.";
        err.solution = "Please sign in with this email, or use another email address.";
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
    const idClean = data.identifier.trim();
    let user = await userRepository.findByEmail(idClean);
    if (!user && (idClean.toLowerCase() === "admin" || idClean.toLowerCase() === "admin@quickbizs.com")) {
      user = (await userRepository.findByEmail("admin@quickbizs.com")) || (await userRepository.findByEmail("admin"));
    }
    if (!user) {
      user = await userRepository.findByPhone(idClean);
    }

    if (!user) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    if (user.isActive === false || user.isDeleted === true) {
      const err: any = new Error("Account is suspended or inactive. Please contact administrator.");
      err.statusCode = 403;
      throw err;
    }

    const rawPassword = data.passwordHash || (data as any).password;
    const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!isMatch) {
      const err: any = new Error("Invalid phone/email or password.");
      err.statusCode = 401;
      throw err;
    }

    const activeRole = user.roles.find((r: any) => r.role?.name === "SuperAdmin")?.role?.name || user.roles[0]?.role?.name || "Owner";
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
        businessName: (user as any).business?.name || (user as any).businessName,
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


export const authService = new AuthService();
