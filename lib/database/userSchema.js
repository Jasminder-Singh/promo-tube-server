import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    userId: { type: String, default: '' },
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    currentPoints: { type: Number, default: 0 },
    todayEarned: { type: Number, default: 0 },
    yesterdayEarned: { type: Number, default: 0 },
    subscriptionType: { type: String, default: 'Basic' },
    actionsDone: { type: Number, default: 0 },
    activeCampaigns: { type: Number, default: 0 },
    totalCampaigns: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    referralCode: { type: String, default: '' },
    referralPointsEarned: { type: Number, default: 0 },
    notifications: [{
        message: { type: String },
        notificationDate: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
    }],
    recentActivites: [{
        activity: { type: String },
        activityDate: { type: Date, default: Date.now }
    }],
    campaigns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        }
    ],
    dailyTasks: [{
        taskText: {
            type: String,
            required: true,
            trim: true,
        },
        points: {
            type: Number,
            required: true,
            default: 0,
        },
        task: { // e.g => campaign, visit etc.
            type: String,
            required: true
        },
        target: {
            type: Number,
            requied: true
        },
        completed: {
            type: Boolean,
            default: false,
        },
        date: {
            type: Date,
            default: Date.now, // optional: when task was created
        }
    }]

}, {
    timestamps: true
});

export const userModel = mongoose.model('User', UserSchema);
