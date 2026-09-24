import { Router, Request, Response, NextFunction } from "express";
import { NotificationController } from "../controllers/notificationController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new NotificationController();

// GET /api/notifications
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getNotifications(req, res, next)
);

// GET /api/notifications/unread
router.get("/unread", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getUnreadNotifications(req, res, next)
);

// GET /api/notifications/count (and count alias)
router.get("/count", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getUnreadCount(req, res, next)
);
router.get("/unread-count", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getUnreadCount(req, res, next)
);

// PUT /api/notifications/:id/read
router.put("/:id/read", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.markAsRead(req, res, next)
);

// PUT /api/notifications/read-all
router.put("/read-all", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.markAllAsRead(req, res, next)
);

// DELETE /api/notifications/:id
router.delete("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.deleteNotification(req, res, next)
);

export default router;
