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
  const { method } = req;
  const { id } = req.query;

  // Connect to the database
  await dbConnect();

  if (method === "POST") {
    try {
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid job ID." });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Find the job by ID
      const job = await Job.findById(id).lean();

      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Check if the user has already applied for this job
      const existingApplication = await JobApplication.findOne({
        job: id,
        applicant: req.user.id,
      }).lean();

      if (existingApplication) {
        return res.status(400).json({ error: "You have already applied for this job." });
      }

      // Create a new job application
      const application = await JobApplication.create({
        job: id,
        applicant: req.user.id,
        appliedAt: new Date(),
        status: "applied",
      });

      res.status(201).json({
        application: {
          _id: (application._id as unknown as string),
          job: (application.job as unknown as string),
          applicant: req.user.id,
          appliedAt: application.appliedAt.toISOString(),
          status: application.status,
        },
      });
    } catch (error: unknown) {
      console.error("Error applying for job:", error);
      res.status(500).json({ error: "Failed to apply for the job." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
