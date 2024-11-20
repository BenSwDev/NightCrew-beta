// pages/api/jobs/[id]/apply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;

  const jobId = query.id as string;

  await dbConnect();

  if (method === "POST") {
    try {
      // Check if the job exists and is active
      const job = await Job.findById(jobId);
      if (!job || !job.isActive) {
        return res.status(404).json({ error: "Job not found or inactive." });
      }

      // Prevent users from applying to their own jobs
      if (job.createdBy.toString() === req.user.id) {
        return res
          .status(400)
          .json({ error: "You cannot apply to your own job." });
      }

      // Check if the user has already applied to this job
      const existingApplication = await JobApplication.findOne({
        job: jobId,
        applicant: req.user.id,
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ error: "You have already applied to this job." });
      }

      // Create a new job application
      const application = await JobApplication.create({
        job: jobId,
        applicant: req.user.id,
      });

      return res.status(201).json({ message: "Application submitted.", application });
    } catch (error) {
      console.error("Error applying to job:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
