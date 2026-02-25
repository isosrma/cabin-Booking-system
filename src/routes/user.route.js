import express from "express";
import { registerUser, loginUser, handleForgotPassword, handleVerifyOtp, handleResetPassword } from "../controller/auth.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", handleForgotPassword);
router.post("/verify-otp", handleVerifyOtp);
router.post("/reset-password", handleResetPassword);
export default router;

     