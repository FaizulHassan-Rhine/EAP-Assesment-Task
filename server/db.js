import mongoose from "mongoose";

let cached = global._mongoose;

export async function connectDb() {
  if (cached?.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  cached = global._mongoose = { conn: null, promise: null };
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
