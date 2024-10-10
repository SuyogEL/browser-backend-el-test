import { Router } from "express";
import { registerUser, loginUser, logout, myAccount, enable2FA, disable2FA, verify2FA } from "../controllers/auth.controller";
import withSession from "../middlewares/withSession";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/verify-2fa").post(verify2FA)
router.route("/logout").delete(withSession, logout)
router.route("/my-account").get(withSession, myAccount)
router.route("/enable-2fa").post(withSession, enable2FA)
router.route("/disable-2fa").post(withSession, disable2FA)  

export default router