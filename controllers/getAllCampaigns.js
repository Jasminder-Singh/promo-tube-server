import { campaignModel } from "../lib/database/campaignSchema.js";
import { connectDB } from "../lib/database/connectDB.js"

export const getAllCampaigns = async (req,res) => {
    try {
        await connectDB();

        const campaigns = await campaignModel.find();
    

        res.status(200).json({ campaigns });

    } catch (error) {

        console.log(`Error in campaing fetching data = `, error);
        res.status(500).json({ message: "Error During Fetching Campaigns." })
    }
}