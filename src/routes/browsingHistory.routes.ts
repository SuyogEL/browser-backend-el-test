import { Router } from "express";
import {
  clearAllHistory,
  getAllHistory,
  logHistory,
  removeHistoryById,
} from "../controllers/browsingHistory.controller";
import withSession from "../middlewares/withSession";

const router = Router();

router.route("/log").post(withSession, logHistory);
router.route("/remove/:historyId").delete(withSession, removeHistoryById);
router.route("/clear").delete(withSession, clearAllHistory);
router.route("/all").get(withSession, getAllHistory);

export default router;
