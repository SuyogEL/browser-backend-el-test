import { Router } from "express";
import withSession from "../middlewares/withSession";
import { clearAllDownloadHistory, getAllDownloadHistory, logDownloadHistory, removeDownloadHistoryById } from "../controllers/downloadHistory.controller";

const router = Router();

router.route("/log").post(withSession, logDownloadHistory);
router.route("/remove/:historyId").delete(withSession, removeDownloadHistoryById);
router.route("/clear").delete(withSession, clearAllDownloadHistory);
router.route("/all").get(withSession, getAllDownloadHistory);

export default router;
