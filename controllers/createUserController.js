import { connectDB } from "../lib/database/connectDB.js"
import { userModel } from "../lib/database/userSchema.js";

export const createUserController = async (req, res) => {
    try {
        await connectDB();
        const { fullName, email: { emailAddress }, userId } = req.body;
        console.log(userId)
        // First check if user already crated.
        const isAlreadyCreated = await userModel.findOne({ userId });
        if (isAlreadyCreated) {
            res.status(409).json({ message: "Account is already created.", user : isAlreadyCreated });
        } else {
            const user = await userModel.create({
                userId,
                email: emailAddress,
                name: fullName,
                recentActivites: [],
                campaigns: [],
                dailyTasks: [],
                notifications: [],
                currentPoints : 3000
            });

            res.status(201).json({ message: 'User Created Successfully.', user: user });
        }

    } catch (error) {
        console.log('Error during creting a user.');
        res.status(500).json({ message: 'Server Error.' })
    }
}
