import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import customerRoutes from "./customerRoutes";
import supplierRoutes from "./supplierRoutes";
import inventoryRoutes from "./inventoryRoutes";
import billingRoutes from "./billingRoutes";
import purchaseRoutes from "./purchaseRoutes";
import financeRoutes from "./financeRoutes";
import reportsRoutes from "./reportsRoutes";
import employeeRoutes from "./employeeRoutes";
import dashboardRoutes from "./dashboardRoutes";
import notificationRoutes from "./notificationRoutes";
import settingsRoutes from "./settingsRoutes";
import saasRoutes from "./saasRoutes";
import systemRoutes from "./systemRoutes";
import globalSearchRoutes from "./globalSearchRoutes";
import customerLedgerRoutes from "./customerLedgerRoutes";
import paymentRoutes from "./paymentRoutes";
import onboardingRoutes from "./onboardingRoutes";
import recoveryRoutes from "./recoveryRoutes";
import counterRoutes from "./counterRoutes";
import instantCheckoutRoutes from "./instantCheckoutRoutes";
import queueRoutes from "./queueRoutes";
import businessTemplateRoutes from "./businessTemplateRoutes";
import quantityRoutes from "./quantityRoutes";
import businessRoutes from "./businessRoutes";
import pwaCustomerRoutes from "./pwaCustomerRoutes";
import pickupOrderRoutes from "./pickupOrderRoutes";
import aiRoutes from "./aiRoutes";
import { logger } from "../utils/logger";

const router = Router();

// Mount API routes
router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/pwa-customer", pwaCustomerRoutes);
router.use("/pickup-orders", pickupOrderRoutes);
router.use("/business", businessRoutes);
router.use("/products", productRoutes);
router.use("/product", productRoutes);
router.use("/payments", paymentRoutes);
router.use("/customers", customerLedgerRoutes);
router.use("/customers", customerRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", billingRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/finance", financeRoutes);
router.use("/reports", reportsRoutes);
router.use("/employees", employeeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin", saasRoutes);
router.use("/system", systemRoutes);
router.use("/search", globalSearchRoutes);
router.use("/", onboardingRoutes);
router.use("/recovery", recoveryRoutes);
router.use("/counter", counterRoutes);
router.use("/checkout", instantCheckoutRoutes);
router.use("/queue", queueRoutes);
router.use("/products", quantityRoutes);
router.use("/templates", businessTemplateRoutes);

// 1. Health Diagnostic Route (Verifies DB connection on-the-fly)
router.get("/health", async (req, res, next) => {
  try {
    // Perform database connection query check
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "QuickBizs Backend is fully online.",
      database: "MySQL (Running/Connected)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check database query failure:", error);
    next(error);
  }
});

// 2. Auth Session Check Route (Retrieves current persona headers)
router.get("/auth/session", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: "Session authenticated.",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

export default router;
