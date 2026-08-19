import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((connection) => {
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        console.error(
          "MongoDB connection failed:",
          error.message
        );

        cached.promise = null;

        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};