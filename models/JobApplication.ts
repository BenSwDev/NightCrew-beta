// models/JobApplication.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { IJob } from "./Job";

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId | IJob;
  applicant: mongoose.Types.ObjectId | IUser;
  appliedAt: Date;
  status: 'applied' | 'connected' | 'declined' | 'withdrawn'; // New field
}

const JobApplicationSchema: Schema<IJobApplication> = new Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['applied', 'connected', 'declined', 'withdrawn'], default: 'applied' }, // Status field
  },
  { timestamps: true }
);

// Pre middleware to exclude withdrawn applications from find queries
JobApplicationSchema.pre(/^find/, function (next) {
  this.where({ status: { $ne: 'withdrawn' } });
  next();
});

const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

export default JobApplication;
