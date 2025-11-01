import { connectDB } from "../lib/database/connectDB.js";
import { userModel } from "../lib/database/userSchema.js";

export const cronJobController = async (req, res) => {
    try {
        await connectDB();
        const users = await userModel.find();

        const savePromises = users.map(async (user) => {
            user.dailyTasks = user.dailyTasks.map((task) => ({
                ...task,
                completed: false,
                date: new Date(),
            }));

            user.yesterdayEarned = user.todayEarned;
            user.todayEarned = 0;

            return await user.save();
        });

        await Promise.all(savePromises);
        console.log('updated users.')


    } catch (error) {
        console.log("error in cron job controller", error);


    }
}