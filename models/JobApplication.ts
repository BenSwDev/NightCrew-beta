// models/JobApplication.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./User";
import { IJob } from "./Job";

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId | IJob; // Can be either ObjectId or populated
  applicant: mongoose.Types.ObjectId | IUser;
  appliedAt: Date;
  status: 'applied' | 'connected' | 'declined' | 'withdrawn';
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
  const query: mongoose.Query<any, IJobApplication> = this as mongoose.Query<any, IJobApplication>; // Cast `this` to `Query`
  query.where({ status: { $ne: "withdrawn" } }); // Apply condition to exclude withdrawn applications
  next();
});

const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);

export default JobApplication;
