import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { AIContextService } from "../services/aiContextService";
import { GroqService } from "../services/groqService";
import { logger } from "../utils/logger";

export class AIController {
  /**
   * POST /api/v1/ai/chat
   * Chat with Quickbizs AI Copilot using verified business context
   */
  public static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string" || !query.trim()) {
        res.status(400).json({
          success: false,
          message: "A query string is required to consult the AI assistant."
        });
        return;
      }

      // Strictly enforce verified tenant scope from authenticated JWT session
      const businessId = req.user?.tenantId || req.user?.businessId;
      if (!businessId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: Missing verified business tenant identity."
        });
        return;
      }

      logger.info(`[QuickBizs AI] Processing store query for tenant: ${businessId} ("${query.slice(0, 50)}...")`);

      // 1. Fetch deterministic database context for the authenticated business
      const { computed, formattedPromptContext } = await AIContextService.getStoreContext(businessId, query.trim());

      // 2. Query QuickBizs AI Engine
      const aiReply = await GroqService.askStoreAI(query.trim(), formattedPromptContext, computed);

      res.status(200).json({
        success: true,
        reply: aiReply,
        storeName: computed.storeName,
        metrics: {
          todaySales: computed.todaySales,
          thisMonthSales: computed.thisMonthSales,
          lowStockCount: computed.lowStockItems.length,
          outstandingUdhaar: computed.totalOutstandingUdhaar
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("[QuickBizs AI] Controller chat error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while consulting the store intelligence assistant. Please try again.",
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * POST /api/v1/ai/forecast
   * Next-day operational demand, roster, and cashflow forecast grounded in real metrics
   */
  public static async forecast(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.user?.tenantId || req.user?.businessId;
      if (!businessId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: Missing verified business tenant identity."
        });
        return;
      }

      logger.info(`[QuickBizs AI] Compiling operational forecast for tenant: ${businessId}`);

      // 1. Fetch deterministic store context
      const { computed, formattedPromptContext } = await AIContextService.getStoreContext(businessId);

      // 2. Generate grounded forecast via QuickBizs AI
      const forecast = await GroqService.getStoreForecast(formattedPromptContext, computed);

      res.status(200).json({
        success: true,
        forecast,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("[QuickBizs AI] Controller forecast error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to compile operational forecast at this time.",
        timestamp: new Date().toISOString()
      });
    }
  }
}
