import mongoose, { Schema } from "mongoose";
const CampaignSchema = new Schema({
    userId: { type: String },// this is the clerk unique user id.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    platform: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: Number, required: true },
    cost: { type: Number, required: true },
    total: { type: Number, required: true },
    pointSpent: { type: Number, required: true },
    status: { type: String, enum: ['active', 'pause', 'completed'], default: 'active' },
    date: { type: Date, default: Date.now },
    link: { type: String },
    text: { type: String },
    completed: { type: Number, default: 0 },
    visited: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]



}, {
    timestamps: true
});

export const campaignModel = mongoose.model("Campaign", CampaignSchema);




