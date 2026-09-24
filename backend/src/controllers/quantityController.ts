import { Response, NextFunction } from "express";
import { QuantityEngine } from "../services/quantityEngine";
import { AuthenticatedRequest } from "../middlewares/auth";

const engine = new QuantityEngine();

export class QuantityController {
  async getPresets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.id);
      const result = await engine.getPresets(productId);
      res.json({
        success: true,
        message: "Product quantity presets fetched successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnitConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.id);
      const result = await engine.getUnitConfig(productId);
      res.json({
        success: true,
        message: "Product unit configuration compiled.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordCustomQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.id);
      const { label, type } = req.body;
      if (label && type) {
        await engine.recordPresetUsage(productId, label, type);
      }
      res.json({
        success: true,
        message: "Preset selection logged successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
