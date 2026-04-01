import mongoose from "mongoose";

// Reuse connection across serverless invocations
if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}
const cache = global._mongoose;

export async function connectDb() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 30000,
        maxPoolSize: 5,
        bufferCommands: false,
      })
      .then((m) => m)
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
