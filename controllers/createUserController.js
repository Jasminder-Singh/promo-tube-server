import { connectDB } from "../lib/database/connectDB.js"
import { userModel } from "../lib/database/userSchema.js";

export const createUserController = async (req, res) => {
    try {
        await connectDB();
        const { fullName, email, userId, referral } = req.body;
        // First check if user already crated.
        console.log(referral)

        const isAlreadyCreated = await userModel.findOne({ email: email.emailAddress }).populate('campaigns');

        if (isAlreadyCreated) {
            res.status(409).json({ message: "Account is already created.", user: isAlreadyCreated });
        } else {
            // if thi user is referred by someone then that user should get 5000 points.
            if (referral) {
                await userModel.findOneAndUpdate(
                    { referralCode: referral },
                    {
                        $inc: {
                            referralPointsEarned: 5000,
                            referralCount: 1,
                            currentPoints: 5000,
                            todayEarned: 5000
                        },
                        $push: {
                            notifications: {
                                message: "Congrats! You’ve earned 5000 points through a referral!",
                                notificationDate: new Date(),
                                isRead: false,
                            }
                        }
                    }, { new: true })
            }
            const user = await userModel.create({
                userId,
                email: email.emailAddress,
                name: fullName,
                recentActivites: [],
                campaigns: [],
                dailyTasks: [],
                notifications: referral ? [{
                    message: "Congrats! You’ve earned 5000 points for joining through a referral!",
                    notificationDate: new Date(),
                    isRead: false,
                },] : [],
                currentPoints: referral ? 3000 + 5000 : 3000,
                referralPointsEarned: referral ? 5000 : 0,
                referralCount: 0,
                todayEarned: referral ? 5000 : 0,
                referralCode: email.emailAddress.split('@')[0]

            });

            res.status(201).json({ message: 'User Created Successfully.', user: user });
        }

    } catch (error) {
        console.log('Error during creting a user.', error);
        res.status(500).json({ message: 'Server Error.' })
    }
}
