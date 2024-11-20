// models/Job.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";

interface ILocation {
  city: string;
  street?: string;
  number?: string;
}

export interface IJob extends Document {
  role: string;
  venue: string;
  location: ILocation;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  paymentType: string;
  paymentAmount: number;
  currency: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null; // New field for soft deletion
  isActive?: boolean; // Virtual field
}

const LocationSchema: Schema<ILocation> = new Schema(
  {
    city: { type: String, required: true },
    street: { type: String },
    number: { type: String },
  },
  { _id: false }
);

const JobSchema: Schema<IJob> = new Schema(
  {
    role: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: LocationSchema, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    paymentType: { type: String, required: true },
    paymentAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null }, // Soft delete field
  },
  { timestamps: true }
);

// Virtual for active status
JobSchema.virtual("isActive").get(function (this: IJob) {
  const now = new Date();
  const jobEndDateTime = new Date(`${this.date}T${this.endTime}:00`);
  return jobEndDateTime > now && !this.deletedAt;
});

// Ensure virtual fields are serialized
JobSchema.set("toJSON", { virtuals: true });
JobSchema.set("toObject", { virtuals: true });

// Pre middleware to conditionally exclude deleted jobs from find queries
JobSchema.pre(/^find/, function (next) {
  // Check if the query has the flag to include deleted jobs
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export default Job;
