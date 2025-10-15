import { Router } from "express";
import { createUserController } from '../controllers/createUserController.js';

const router = Router();

router.post('/createUser', createUserController);
export default router;

