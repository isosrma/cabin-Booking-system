import express from 'express';
import { protectedRoutes } from '../middleware/protectedRoutes.js';
import { initiatePayment, verifyPayment } from '../controller/payment.controller.js';
const router = express.Router();

router.post('/initiate', protectedRoutes, initiatePayment);
router.post('/verify', protectedRoutes, verifyPayment);

export default router;