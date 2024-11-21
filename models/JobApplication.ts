// models/JobApplication.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { IJob } from "./Job";

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId | IJobPopulated; // Updated to use IJobPopulated
  applicant: mongoose.Types.ObjectId | IUserPopulated; // Assuming similar populated interface
  appliedAt: Date;
  status: 'applied' | 'connected' | 'declined' | 'withdrawn';
}

// Define interfaces for populated fields
export interface IUserPopulated extends IUser {
  // Add additional fields if necessary
}

export interface IJobPopulated extends IJob {
  // Add additional fields if necessary
}

export interface IJobApplicationPopulated extends IJobApplication {
  job: IJobPopulated;
  applicant: IUserPopulated;
}

const JobApplicationSchema: Schema<IJobApplication> = new Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['applied', 'connected', 'declined', 'withdrawn'], default: 'applied' },
  },
  { timestamps: true }
);

// Pre middleware to exclude withdrawn applications from find queries
JobApplicationSchema.pre(/^find/, function (this: mongoose.Query<any, IJobApplication>, next) {
  const query = this;
  query.where({ status: { $ne: "withdrawn" } });
  next();
});

const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

export default JobApplication;
