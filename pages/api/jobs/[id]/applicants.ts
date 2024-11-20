// pages/api/jobs/[id]/applicants.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import User from "@/models/User";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

interface Applicant {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string;
  appliedAt: Date;
}

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;
  const jobId = query.id as string;

  await dbConnect();

  if (method === "GET") {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Ensure the user is the creator of the job
      if (job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access." });
      }

      const applications = await JobApplication.find({ job: jobId }).populate("applicant", "name email avatarUrl");

      const applicants: Applicant[] = applications.map((app) => ({
        _id: app.applicant._id.toString(),
        name: app.applicant.name,
        email: app.applicant.email,
        avatarUrl: app.applicant.avatarUrl,
        appliedAt: app.appliedAt,
      }));

      res.status(200).json({ applicants });
    } catch (error) {
      console.error("Error fetching applicants for job:", error);
      res.status(500).json({ error: "Failed to fetch applicants." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
