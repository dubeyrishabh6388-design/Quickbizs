import { Response, NextFunction } from "express";
import { QueueService } from "../services/queueService";
import { AuthenticatedRequest } from "../middlewares/auth";

const service = new QueueService();

export class QueueController {
  async getQueues(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await service.getQueues(businessId);
      res.json({
        success: true,
        message: "Active queues fetched.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQueueById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const result = await service.getQueueById(businessId, id);
      res.json({
        success: true,
        message: "Queue session fetched.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { customerName, mobile, items } = req.body;
      const result = await service.createQueue(businessId, customerName, mobile, items);
      res.json({
        success: true,
        message: "Queue session created successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const { paymentMethod } = req.body;
      const result = await service.completeQueue(businessId, id, paymentMethod || "Cash");
      res.json({
        success: true,
        message: "Queue session cleared and settled.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const result = await service.cancelQueue(businessId, id);
      res.json({
        success: true,
        message: "Queue session cancelled successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async merge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id); // sourceId
      const { targetQueueId } = req.body;
      const result = await service.mergeQueues(businessId, id, targetQueueId);
      res.json({
        success: true,
        message: "Queue sessions merged successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const result = await service.duplicateQueue(businessId, id);
      res.json({
        success: true,
        message: "Queue session duplicated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async pin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const { isPinned } = req.body;
      const result = await service.pinQueue(businessId, id, isPinned);
      res.json({
        success: true,
        message: "Queue session pin status changed.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const id = String(req.params.id);
      const { items } = req.body;
      const result = await service.updateQueueItems(businessId, id, items);
      res.json({
        success: true,
        message: "Queue items synced successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
