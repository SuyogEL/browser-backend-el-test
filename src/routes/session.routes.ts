import { Router } from "express";
import { getAllSession, removeSession } from "../controllers/session.controller";

const router = Router();

router.route("/get-all").get(getAllSession)
router.route("/remove").delete(removeSession)

export default router