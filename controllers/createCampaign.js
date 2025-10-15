import { campaignModel } from "../lib/database/campaignSchema.js";
import { connectDB } from "../lib/database/connectDB.js";
import { userModel } from '../lib/database/userSchema.js'
export const createCampaign = async (req, res) => {
    try {
        await connectDB();
        const campaignData = req.body;



        const newCampaign = await campaignModel.create({
            userId: campaignData.userId,// this is the clerk unique user id.
            user: campaignData.id,
            platform: campaignData.platform,
            action: campaignData.action,
            target: campaignData.target,
            cost: campaignData.cost,
            total: campaignData.total,
            pointSpent: campaignData.pointSpent,
            status: campaignData.status,
            date: campaignData.date,
            link: campaignData.link,
            text: campaignData.text,
            completed: 0,
            visited : []

        });

        const user = await userModel.findByIdAndUpdate({ _id: campaignData.id },

            {
                $inc: {
                    currentPoints: -campaignData.total,
                    activeCampaigns: 1,
                    totalCampaigns : 1
                },
                $push: { campaigns: newCampaign._id },
            },
            { new: true }
        );


        res.status(201).json({ message: "Campaign created successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Campaign Error." });
    }
}
