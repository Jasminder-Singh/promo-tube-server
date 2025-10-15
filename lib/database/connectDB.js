import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);

    } catch (error) {
        console.log(`Error while connection database ${error}`)
    }
}

export const disconnctDB = async () => {
    try {
        await mongoose.disconnect(process.env.DB_URL);
    } catch (error) {
        console.log(`Error while disconnect database ${error}`);
    }
}