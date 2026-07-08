import mongoose = require("mongoose");

const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGODB_URI as string
    );

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error);

    process.exit(1);
  }
};

export default connectDB;