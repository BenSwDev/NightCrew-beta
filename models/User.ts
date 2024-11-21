// models/User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dateOfBirth: Date;
  avatarUrl: string;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"], // Corrected maxlength
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: { // Ensure phone is included
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Please specify your gender"],
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: { // Added field
      type: Date,
      required: [true, "Please provide your date of birth"],
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
