import mongoose from "mongoose";

export async function runMongo() {
  await mongoose.connect(process.env.MONGO_URL).then(_ => console.log('Mongo Connected!!!'));
}