// pages/api/jobs/[id]/applicants.ts

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
  const { id } = req.query;

  // Connect to the database
  await dbConnect();

  if (method === "GET") {
    try {
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid job ID." });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Verify that the job belongs to the user
      const job = await Job.findOne({ _id: id, createdBy: req.user.id })
        .setOptions({ includeDeleted: true })
        .lean();

      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Find all applications for this job
      const applications = await JobApplication.find({ job: id })
        .populate("applicant", "name email avatarUrl")
        .lean();

      // Map applications to applicants
      const applicants: Applicant[] = applications.map((app) => {
        if (!app.applicant || typeof app.applicant === "string") {
          throw new Error(`Applicant not populated for application ID ${String(app._id)}`);
        }

        const applicantData = app.applicant as {
          _id: string | { toString(): string };
          name: string;
          email: string;
          avatarUrl: string;
        };

        return {
          _id: typeof applicantData._id === "string" ? applicantData._id : applicantData._id.toString(),
          name: applicantData.name,
          email: applicantData.email,
          avatarUrl: applicantData.avatarUrl,
          status: app.status as "pending" | "connected" | "declined",
        };
      });

      const jobApplicants: JobApplicants = {
        job: {
          _id: job._id.toString(), // Ensure _id is converted to string
          role: job.role,
          venue: job.venue,
          date: job.date,
          isActive: job.isActive || false,
          deletedAt: job.deletedAt ? job.deletedAt.toISOString() : null,
        },
        applicants,
      };

      res.status(200).json({ jobApplicants });
    } catch (error: unknown) {
      console.error("Error fetching applicants:", error);
      res.status(500).json({ error: "Failed to fetch applicants." });
    }
  } else if (method === "PUT") {
    try {
      const { applicantId, action } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid job ID." });
      }

      if (!applicantId || !["connect", "decline"].includes(action)) {
        return res.status(400).json({ error: "Invalid request parameters." });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Verify that the job belongs to the user
      const job = await Job.findOne({ _id: id, createdBy: req.user.id })
        .setOptions({ includeDeleted: true })
        .lean();

      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Find the application
      const application = await JobApplication.findOne({ job: id, applicant: applicantId });

      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      // Update the status
      application.status = action === "connect" ? "connected" : "declined";
      await application.save();

      res.status(200).json({ message: `Applicant ${action}ed successfully.` });
    } catch (error: unknown) {
      console.error("Error updating applicant status:", error);
      res.status(500).json({ error: "Failed to update applicant status." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
