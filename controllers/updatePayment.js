import fetch from "node-fetch";
import { connectDB } from "../lib/database/connectDB.js";
import { userModel } from "../lib/database/userSchema.js";

export const updatePaymentController = async (req, res) => {
    try {
        const { email, payment_id, payment_request_id, points, plan } = req.body;
    
        if (!email || !payment_id || !payment_request_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: email, payment_id, or payment_request_id",
            });
        }

        await connectDB();

        // 🧾 Step 1: Verify the payment using Instamojo API
        const verifyRes = await fetch(`https://api.instamojo.com/v2/payments/${payment_id}/`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.INSTAMOJO_PRIVATE_AUTH_TOKEN}`, // Replace with your token
            },
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || verifyData.status !== "Credit") {
            console.log("Payment verification failed:", verifyData);
            return res.status(400).json({
                success: false,
                message: "Payment not verified. Please contact support.",
                data: verifyData,
            });
        }

        // ✅ Step 2: Update the user record in MongoDB
        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    subscriptionType: plan // or based on plan
                },
                $inc: {
                    currentPoints: points, // add points for premium plan
                },
                $push: {
                    notifications: {
                        message: `🎉 Payment successful! Your ${plan} plan has been activated.`,
                    },
                    recentActivites: {
                        activity: `Upgraded to ${plan} via Instamojo.`,
                    },
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found in the database.",
            });
        }

        console.log("✅ Payment verified and user updated:", updatedUser.email);

        // ✅ Step 3: Respond to frontend
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while verifying payment.",
            error: error.message,
        });
    }
};
