import { Router } from "express";
import authRoutes from "./auth.routes";
import browseHistoryRoutes from "./browsingHistory.routes";
import downloadHistoryRoutes from "./downloadHistory.routes";
import sessionRoutes from "./session.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/browse-history", browseHistoryRoutes);
router.use("/download-history", downloadHistoryRoutes);
router.use("/session", sessionRoutes);

export default router