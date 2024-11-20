// pages/api/jobs/[id]/apply.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query; // Job ID

  await dbConnect();

  if (method === "POST") {
    try {
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid job ID." });
      }

      // Check if the job exists and is active
      const job = await Job.findOne({ _id: id, isActive: true });
      if (!job) {
        return res.status(404).json({ error: "Job not found or inactive." });
      }

      // Check if the user has already applied to this job
      const existingApplication = await JobApplication.findOne({
        job: id,
        applicant: req.user.id,
      });

      if (existingApplication) {
        return res.status(400).json({ error: "You have already applied to this job." });
      }

      // Create a new application
      const application = await JobApplication.create({
        job: id,
        applicant: req.user.id,
      });

      res.status(201).json({ message: "Applied to job successfully.", applicationId: application._id });
    } catch (error: unknown) {
      console.error("Error applying to job:", error);
      if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "Failed to apply to job." });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
