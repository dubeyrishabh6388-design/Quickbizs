import { Request, Response, NextFunction } from "express";
import { GeminiService, StoreContextSnapshot } from "../services/geminiService";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

export class AIController {
  /**
   * POST /api/ai/chat
   * Chat with Gemini AI with live store data
   */
  public static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, storeContext } = req.body;

      if (!query || typeof query !== "string" || !query.trim()) {
        res.status(400).json({
          success: false,
          message: "A query string is required to consult the AI assistant."
        });
        return;
      }

      const businessId = (req as any).user?.businessId || req.headers["x-business-id"] as string;
      let enrichedContext: StoreContextSnapshot = storeContext || {};

      // If businessId is available, enrich with database records if not fully supplied
      if (businessId && (!storeContext || !storeContext.todaySales)) {
        try {
          const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { name: true, businessType: true }
          });

          if (business) {
            enrichedContext.storeName = enrichedContext.storeName || business.name;
            enrichedContext.businessType = enrichedContext.businessType || business.businessType || "Retail Store";
          }

          // Fetch low stock items from inventory
          const lowStock = await prisma.inventory.findMany({
            where: {
              businessId,
              stock: { lte: 10 }
            },
            take: 10,
            select: {
              product: { select: { name: true, price: true } },
              stock: true,
              minStock: true
            }
          });

          if (lowStock.length > 0 && !enrichedContext.lowStockItems) {
            enrichedContext.lowStockItems = lowStock.map(i => ({
              name: i.product?.name || "Unknown Product",
              stock: i.stock,
              minStock: i.minStock || 10,
              price: Number(i.product?.price || 0)
            }));
          }

          // Fetch top pending Udhaar customers
          const udhaarCusts = await prisma.customer.findMany({
            where: {
              businessId,
              pendingAmount: { gt: 0 }
            },
            orderBy: { pendingAmount: "desc" },
            take: 5,
            select: { name: true, mobile: true, pendingAmount: true }
          });

          if (udhaarCusts.length > 0 && !enrichedContext.topUdhaarCustomers) {
            enrichedContext.topUdhaarCustomers = udhaarCusts.map(c => ({
              name: c.name,
              phone: c.mobile || undefined,
              pendingDues: Number(c.pendingAmount)
            }));
            enrichedContext.totalOutstandingUdhaar = udhaarCusts.reduce((acc, c) => acc + Number(c.pendingAmount), 0);
          }
        } catch (dbErr: any) {
          logger.warn(`Could not enrich AI context from DB: ${dbErr?.message || dbErr}`);
        }
      }

      logger.info(`Processing store AI query: "${query}" for ${enrichedContext.storeName || "Store"}`);
      const aiReply = await GeminiService.askStoreAI(query, enrichedContext);

      res.status(200).json({
        success: true,
        reply: aiReply,
        storeName: enrichedContext.storeName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error("AI Controller chat error:", error);
      next(error);
    }
  }

  /**
   * POST /api/ai/forecast
   * Next-day demand and roster forecasting
   */
  public static async forecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storeContext } = req.body;
      const forecast = await GeminiService.getStoreForecast(storeContext);

      res.status(200).json({
        success: true,
        forecast,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error("AI Controller forecast error:", error);
      next(error);
    }
  }
}
