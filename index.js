import express from "express";
import http from 'http'
import { Server } from "socket.io";
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import creatUserRoute from './routes/createUserRoute.js';
import creatCampaignRoute from './routes/createCampaignRoute.js';
import verifyPayment from './routes/verifyPayment.js';
import dailyTasks from './routes/dailyTasks.js';
import { userModel } from "./lib/database/userSchema.js";
import { campaignModel } from "./lib/database/campaignSchema.js";
import { connectDB } from "./lib/database/connectDB.js";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
// Importing the router .

app.use('/api/user', creatUserRoute);
app.use('/api/campaign', creatCampaignRoute);
app.use('/api/payment', verifyPayment);
app.use('/api/create', dailyTasks)


app.get('/api', (req, res) => {
    res.send('This is rest api.')
})

const io = new Server(server, {
    cors: '*',
    methods: ['GET', 'POST']
});

// set the notifiaction to the user profile.
function setMessage(completed, target, platform) {
    if (completed === 1) {
        return `🔥 Amazing! Your ${platform} campaign just got its first viewer!`;
    } else if (completed === Math.floor(target / 2)) {
        return `🎉 Hurray! Your ${platform} campaign reached half of its target!`;
    } else if (completed === target) {
        return `🏆 Congrats! Your ${platform} campaign just achieved its target!`;
    } else {
        return `👀 Your ${platform} campaign has ${completed} out of ${target} views. Keep going!`;
    }
}
io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        console.log('Server is Disconnected.')
    })

    socket.on('earned_points', async ({ points, campaignCreatedUserId, visitorId, campaignId }) => {

        try {
            await connectDB()
            const visitor = await userModel.findByIdAndUpdate({ _id: visitorId },
                {
                    $inc: {
                        currentPoints: points,
                        todayEarned: points,
                        actionsDone: 1
                    },
                    $push: {
                        recentActivites: {
                            activity: `Hurray! You earned ${points} points.`,
                            activityDate: Date.now()
                        }
                    }
                }, { new: true });

            const campaignVisited = await campaignModel.findOneAndUpdate(
                {
                    _id: campaignId,
                    $expr: { $lt: ["$completed", "$target"] }
                },
                {
                    $inc: {
                        completed: 1,
                        pointSpent: points
                    },
                    $addToSet: { visited: visitorId }
                },
                { new: true }
            );
            const { completed, target, platform } = campaignVisited;

            let message = setMessage(completed, target, platform);

            const campaignCreator = await userModel.findByIdAndUpdate({ _id: campaignCreatedUserId }, {
                $push: {
                    notifications: {
                        message: message,
                        notificationDate: Date.now(),
                        isRead: false
                    }
                }
            }, { new: true });

            io.emit('points_updated', { campaignVisited });
            socket.emit('user_earned', { campaignCreator, visitor });
        } catch (error) {
            console.log("Error during earned_points", error);


        }
    });

    socket.on('campaignDailyTask', async (email, campaigns) => { // campaigns = [{},{},{},{}]
        await connectDB();
        const user = await userModel.findOne({ email }).populate('campaigns');

        const todayCreatedCampaigns = user.campaigns.reduce((acc, camp) => {
            return (new Date(camp.date).getDate() === new Date().getDate()) ? acc + 1 : acc

        }, 0)

        let taskPoints = 0;
        if (todayCreatedCampaigns) {

            const dailyTasks = user.dailyTasks.map((dt) => {
                if (dt.task === 'campaign' && todayCreatedCampaigns >= dt.target && !dt.completed) {
                    taskPoints += dt.points;
                    return {
                        ...dt,
                        completed: true,


                    }
                }
                return dt;
            });

            user.dailyTasks = dailyTasks;
            user.currentPoints += taskPoints;
            user.todayEarned += taskPoints
            user.save();

        }



        socket.emit('confirmCampaignTask', user);
    })
    socket.on('read_notification', async ({ id }) => {
        await connectDB()
        await userModel.updateMany(
            { _id: id, "notifications.isRead": false },
            { $set: { "notifications.$[].isRead": true } },
            { new: true }
        );

    })
});

server.listen(3001, () => {
    console.log('Server is listening.')
})