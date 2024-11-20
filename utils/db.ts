// utils/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully.");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error);
        throw new Error("MongoDB connection error");
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * This ensures the database connection is reattempted automatically
 * if it drops due to network issues or server errors.
 */
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
  dbConnect();
});

export default dbConnect;
