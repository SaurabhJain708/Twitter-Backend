import mongoose from "mongoose"


const connectdb = async ()=>{
    try {
        const mongoconnectioninstance = await mongoose.connect(process.env.MONGODB_URI!)
        console.log(`\n MongoDB connected !! DB HOST: ${mongoconnectioninstance.connection.host}`)
    } catch (error) {
        console.log("Mongoose connection terminated", error);
        await mongoose.connection.close();
        console.log("MongoDB connection closed. Exiting process...");
        process.exit(1);
    }
}

export default connectdb  