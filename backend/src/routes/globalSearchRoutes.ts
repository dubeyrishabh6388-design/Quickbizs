import { Router, Request, Response, NextFunction } from "express";
import { globalSearchController } from "../controllers/globalSearchController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /api/search?q=
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  globalSearchController.search(req, res, next)
);

// GET /api/search/recent
router.get("/recent", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  globalSearchController.getRecent(req, res, next)
);

// GET /api/search/favorites
router.get("/favorites", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  globalSearchController.getFavorites(req, res, next)
);

// POST /api/search/favorites
router.post("/favorites", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  globalSearchController.addFavorite(req, res, next)
);

// DELETE /api/search/favorites/:id
router.delete("/favorites/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  globalSearchController.removeFavorite(req, res, next)
);

export default router;
