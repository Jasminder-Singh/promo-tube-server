import { connectDB } from "../lib/database/connectDB.js";
import { userModel } from "../lib/database/userSchema.js";

export const updateDailyTasks = async (req, res) => {
    try {

        const tasks = req.body;
        await connectDB();
        const user = await userModel.updateMany({},
            {
                $set: {
                    dailyTasks: tasks
                }
            }, { new: true })
            console.log(user);

        res.status(201).json({ message: 'Updated successfully.', user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server side error.' })
    }
}