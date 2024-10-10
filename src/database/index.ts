import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const connectdb = async () => {
  try {
    await mongoose.connect(process.env["DATABASE_URL"] as string)
    console.log(`connected to mongodb ${mongoose.connection.host}`)
  } catch (error) {
    console.log(error)
  }
}