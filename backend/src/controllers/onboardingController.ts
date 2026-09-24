import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { BUSINESS_TEMPLATES } from "../config/templates";
import { BusinessTemplateService } from "../services/businessTemplateService";

const templateService = new BusinessTemplateService();

export class OnboardingController {
  // POST /api/onboarding/start
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password, businessName, phone, address } = req.body;

      if (!email || !name || !password || !businessName) {
        return res.status(400).json({
          success: false,
          message: "Onboarding start parameters (email, name, password, businessName) are required."
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user account with this email address already exists."
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Create business & user in a database transaction
      const result = await prisma.$transaction(async (tx) => {
        const business = await tx.business.create({
          data: {
            name: businessName,
          }
        });

        // Seed default roles for this business
        const rolesToCreate = ["Owner", "Cashier", "Accountant", "Warehouse", "SuperAdmin", "Manager", "Employee"];
        const createdRoles = await Promise.all(
          rolesToCreate.map((r) =>
            tx.role.create({
              data: {
                businessId: business.id,
                name: r,
              }
            })
          )
        );

        // Find Owner role
        const ownerRole = createdRoles.find(r => r.name === "Owner")!;

        // Create User
        const user = await tx.user.create({
          data: {
            businessId: business.id,
            name,
            email,
            passwordHash: hash,
            phone: phone || null,
          }
        });

        // Map user to Owner role
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: ownerRole.id,
          }
        });

        // Create business settings record
        await tx.businessSetting.create({
          data: {
            businessId: business.id,
            companyName: businessName,
            address: address || null,
            phone: phone || null,
          }
        });

        return { user, business, role: ownerRole };
      });

      // Generate sessions tokens
      const accessToken = generateAccessToken(result.user.id, result.business.id, result.role.name);
      const refreshToken = generateRefreshToken(result.user.id);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.session.create({
        data: {
          userId: result.user.id,
          token: accessToken,
          refreshToken,
          expiresAt
        }
      });

      return res.status(201).json({
        success: true,
        message: "Smart Onboarding started successfully.",
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.role.name,
            businessId: result.business.id,
            businessName: result.business.name,
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/onboarding/complete
  async complete(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Business context identifier missing."
        });
      }

      const { businessType, features, businessSize, sellOnline } = req.body;

      if (!businessType || !features || !businessSize) {
        return res.status(400).json({
          success: false,
          message: "Onboarding configuration fields (businessType, features, businessSize) are required."
        });
      }

      const template = BUSINESS_TEMPLATES[businessType] || BUSINESS_TEMPLATES["Custom Business"];

      // Update preferences
      await prisma.businessPreference.upsert({
        where: { businessId: tenantId },
          create: {
            businessId: tenantId,
            businessType,
            businessSize,
            sellOnline: !!sellOnline,
            visibleModules: JSON.stringify(template.enabledModules),
            dashboardLayout: JSON.stringify(template.dashboardWidgets),
            productAttributes: JSON.stringify(template.customAttributes || []),
          },
          update: {
            businessType,
            businessSize,
            sellOnline: !!sellOnline,
            visibleModules: JSON.stringify(template.enabledModules),
            dashboardLayout: JSON.stringify(template.dashboardWidgets),
            productAttributes: JSON.stringify(template.customAttributes || []),
          }
        });

        // Create welcome system notification
        await prisma.notification.create({
          data: {
            businessId: tenantId,
            title: `Welcome to QuickBizs ${businessType}!`,
            message: `Your smart onboarding configuration has completed successfully. Your dashboard, product configurations, and sidebar widgets have been customized.`,
            type: "Information",
            priority: "High",
            module: "System"
          }
        });

      // Automatically configure smart layouts, templates, and widgets
      let sellingStyle = "Retail Mode";
      if (["Dairy Shop", "Kirana Store", "Paan Shop", "Sweet Shop", "Bakery", "Juice Center", "Grocery Store"].includes(businessType)) {
        sellingStyle = "Counter Mode";
      } else if (businessType === "Wholesale Business") {
        sellingStyle = "Wholesale Mode";
      }

      await templateService.applyTemplate(tenantId, businessType, sellingStyle, businessSize);

      return res.json({
        success: true,
        message: "Smart Onboarding setup generated automatically.",
        data: {
          businessType,
          businessSize,
          visibleModules: template.enabledModules,
          dashboardLayout: template.dashboardWidgets,
          productAttributes: template.customAttributes || []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business/template
  async getTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string;
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'category' is required."
        });
      }

      const template = BUSINESS_TEMPLATES[category];
      if (!template) {
        return res.status(404).json({
          success: false,
          message: `No predefined setup configuration found for category: ${category}`
        });
      }

      return res.json({
        success: true,
        data: template
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/business/preferences
  async updatePreferences(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Business context identifier missing."
        });
      }

      const { businessType, businessSize, visibleModules, dashboardLayout, productAttributes } = req.body;

      const updated = await prisma.businessPreference.update({
        where: { businessId: tenantId },
        data: {
          businessType: businessType || undefined,
          businessSize: businessSize || undefined,
          visibleModules: visibleModules ? JSON.stringify(visibleModules) : undefined,
          dashboardLayout: dashboardLayout ? JSON.stringify(dashboardLayout) : undefined,
          productAttributes: productAttributes ? JSON.stringify(productAttributes) : undefined,
        }
      });

      return res.json({
        success: true,
        message: "Business preferences updated successfully.",
        data: {
          businessType: updated.businessType,
          businessSize: updated.businessSize,
          visibleModules: JSON.parse(updated.visibleModules),
          dashboardLayout: JSON.parse(updated.dashboardLayout),
          productAttributes: updated.productAttributes ? JSON.parse(updated.productAttributes) : []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/business/features
  async getFeatures(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Business context identifier missing."
        });
      }

      const preferences = await prisma.businessPreference.findUnique({
        where: { businessId: tenantId }
      });

      return res.json({
        success: true,
        data: {
          features: {
            gstRequired: false,
            barcodeRequired: false,
            inventoryTracking: true,
            creditLedger: true,
            purchaseManagement: true,
            employeeManagement: true,
            homeDelivery: false,
            multiBranch: false
          },
          preferences: preferences ? {
            businessType: preferences.businessType,
            businessSize: preferences.businessSize,
            sellOnline: preferences.sellOnline,
            visibleModules: JSON.parse(preferences.visibleModules),
            dashboardLayout: JSON.parse(preferences.dashboardLayout),
            productAttributes: preferences.productAttributes ? JSON.parse(preferences.productAttributes) : []
          } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
