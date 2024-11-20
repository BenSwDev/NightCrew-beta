// pages/api/applications/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import Job from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;

  await dbConnect();

  const applicationId = query.id as string;

  if (method === "DELETE") {
    try {
      // Find the application
      const application = await JobApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      // Ensure that the application belongs to the authenticated user
      if (application.applicant.toString() !== req.user.id) {
        return res.status(403).json({ error: "You are not authorized to withdraw this application." });
      }

      // Check if the job's date and end time have not yet passed
      const job = await Job.findById(application.job);
      if (!job) {
        return res.status(404).json({ error: "Associated job not found." });
      }

      const now = new Date();
      const jobEndDateTime = new Date(`${job.date}T${job.endTime}:00`);
      if (jobEndDateTime < now) {
        return res.status(400).json({ error: "Cannot withdraw application for a job that has already ended." });
      }

      // Delete the application
      await application.remove();

      res.status(200).json({ message: "Application withdrawn successfully." });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      res.status(500).json({ error: "Failed to withdraw application." });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
