import { Router } from "express";
import { updatePaymentController } from '../controllers/updatePayment.js';

const router = Router();

router.post('/verifyPayment', updatePaymentController);
export default router;

