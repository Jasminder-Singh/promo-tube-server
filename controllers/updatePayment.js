import fetch from "node-fetch";
import { connectDB } from "../lib/database/connectDB.js";
import { userModel } from "../lib/database/userSchema.js";
let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    const now = Date.now();

    // ✅ Reuse if valid
    if (accessToken && now < tokenExpiry) {
        return accessToken;
    }

    // 🔁 Otherwise, fetch a new one
    const tokenRes = await fetch("https://api.instamojo.com/oauth2/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.INSTAMOJO_CLIENT_ID,
            client_secret: process.env.INSTAMOJO_CLIENT_SECRET,
        }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
        console.error("Token Fetch Failed:", tokenData);
        throw new Error("Unable to generate Instamojo token");
    }

    accessToken = tokenData.access_token;
    tokenExpiry = now + tokenData.expires_in * 1000;

    return accessToken;
}

export const updatePaymentController = async (req, res) => {
    try {
        const { email, payment_id, payment_request_id, points, plan } = req.body;

        if (!email || !payment_id || !payment_request_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: email, payment_id, or payment_request_id",
            });
        }

        const token = await getAccessToken();


        // // 🧾 Step 1: Verify the payment using Instamojo API
        const verifyRes = await fetch(`https://api.instamojo.com/v2/payments/${payment_id}/`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`, // Replace with your token
            },
        });

   
        const verifyData = await verifyRes.json();
       
        if (!verifyRes.ok || verifyData.failure !== null) {

            // Check if it was an API error (e.g., 404, 500)
            if (!verifyRes.ok) {
                console.log("API communication failed with status:", verifyRes.status);
                return res.status(verifyRes.status || 500).json({
                    success: false,
                    message: "Failed to connect to the payment verification service.",
                    data: verifyData,
                });
            }

            // Otherwise, it was a payment processing error (failure field is present)
            console.log("Payment failed during processing:", verifyData.failure);
            return res.status(400).json({
                success: false,
                message: "Payment failed. Please check details or contact support.",
                data: verifyData, // Include the full data for debugging
            });
        }

        await connectDB();
        // ✅ Step 2: Update the user record in MongoDB
        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    subscriptionType: plan // or based on plan
                },
                $inc: {
                    currentPoints: points.includes("2X") ? 0 : parseInt(points.split(" ")[0]), // add points for premium plan
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
            res.status(404).json({
                success: false,
                message: "User not found in the database.",
            });
        }
       
        // ✅ Step 3: Respond to frontend
        res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while verifying payment.",
            error: error.message,
        });
    }
};
