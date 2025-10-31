import { Router } from "express";
import {updateDailyTasks} from '../controllers/updateDailyTask.js'

const router = Router();

router.post('/dailyTasks', updateDailyTasks);
export default router;

