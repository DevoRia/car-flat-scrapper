import mongoose from "mongoose";

export async function runMongo() {
  await mongoose.connect(process.argv[2]).then(_ => console.log('Mongo Connected!!!'));
}