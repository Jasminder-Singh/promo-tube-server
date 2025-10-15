import { Router } from "express";
import { createCampaign } from "../controllers/createCampaign.js";
import { getAllCampaigns } from "../controllers/getAllCampaigns.js";

const router = Router();
router.get('/getAllCampaign', getAllCampaigns);
router.post('/createCampaign', createCampaign)

export default router