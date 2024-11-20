// pages/api/my-jobs/applicants.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

interface Applicant {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: "pending" | "connected" | "declined";
}

interface JobApplicants {
  job: {
    _id: string;
    role: string;
    venue: string;
    date: string;
    isActive: boolean;
    deletedAt?: string | null;
  };
  applicants: Applicant[];
}

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      // Find all jobs created by the user, including deleted jobs
      const userJobs = await Job.find({ createdBy: req.user.id })
        .setOptions({ includeDeleted: true }) // Include deleted jobs
        .select("_id role venue date deletedAt isActive")
        .lean(); // Use lean for faster queries

      if (userJobs.length === 0) {
        return res.status(200).json({ jobApplicants: [] });
      }

      const jobIds = userJobs.map((job) => job._id);

      // Find all applications to these jobs
      const applications = await JobApplication.find({ job: { $in: jobIds } })
        .populate("applicant", "name email avatarUrl")
        .populate("job", "role venue date deletedAt")
        .lean();

      // Group applicants by job
      const groupedApplicants: { [key: string]: Applicant[] } = {};

      applications.forEach((app) => {
        const jobId = app.job._id.toString();
        if (!groupedApplicants[jobId]) {
          groupedApplicants[jobId] = [];
        }
        groupedApplicants[jobId].push({
          _id: app._id.toString(),
          name: app.applicant.name,
          email: app.applicant.email,
          avatarUrl: app.applicant.avatarUrl,
          status: app.status as "pending" | "connected" | "declined",
        });
      });

      // Prepare the response
      const jobApplicants: JobApplicants[] = userJobs.map((job) => ({
        job: {
          _id: job._id.toString(),
          role: job.role,
          venue: job.venue,
          date: job.date,
          isActive: job.isActive,
          deletedAt: job.deletedAt ? job.deletedAt.toISOString() : null,
        },
        applicants: groupedApplicants[job._id.toString()] || [],
      }));

      res.status(200).json({ jobApplicants });
    } catch (error) {
      console.error("Error fetching applicants:", error);
      res.status(500).json({ error: "Failed to fetch applicants." });
    }
  } else if (method === "PUT") {
    try {
      const { jobId, applicantId, action } = req.body;

      if (!jobId || !applicantId || !["connect", "decline"].includes(action)) {
        return res.status(400).json({ error: "Invalid request parameters." });
      }

      // Verify that the job belongs to the user
      const job = await Job.findOne({ _id: jobId, createdBy: req.user.id }).setOptions({ includeDeleted: true });
      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Find the application
      const application = await JobApplication.findOne({ job: jobId, applicant: applicantId });
      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      // Update the status
      application.status = action === "connect" ? "connected" : "declined";
      await application.save();

      res.status(200).json({ message: `Applicant ${action}ed successfully.` });
    } catch (error) {
      console.error("Error updating applicant status:", error);
      res.status(500).json({ error: "Failed to update applicant status." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
