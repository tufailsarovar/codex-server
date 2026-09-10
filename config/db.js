import mongoose from "mongoose";

const globalMongoose = globalThis;

if (!globalMongoose.__mongooseCache) {
  globalMongoose.__mongooseCache = {
    conn: null,
    promise: null,
  };
}

const cached = globalMongoose.__mongooseCache;

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  // Reuse existing connection
  if (
    cached.conn &&
    mongoose.connection.readyState === 1
  ) {
    return cached.conn;
  }

  // Reuse connection currently being established
  if (cached.promise) {
    return cached.promise;
  }

  cached.promise = mongoose
    .connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,

      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,

      bufferCommands: false,
    })
    .then((connection) => {
      cached.conn = connection;

      console.log("MongoDB connected successfully");

      return connection;
    })
    .catch((error) => {
      cached.conn = null;
      cached.promise = null;

      console.error(
        "MongoDB connection failed:",
        error.message
      );

      throw error;
    });

  return cached.promise;
};