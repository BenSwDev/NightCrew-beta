// pages/api/history/applications/[id].ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

interface PopulatedJob {
  _id: string;
  role: string;
  venue: string;
  date: string;
}

interface HistoryApplication {
  _id: string;
  job: PopulatedJob;
  appliedAt: string;
  status: 'withdrawn';
}

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query; // Application ID

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid application ID." });
  }

  if (method === "GET") {
    try {
      const application = await JobApplication.findById(id)
        .populate("job", "role venue date")
        .lean();

      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      // Ensure the application belongs to the authenticated user
      if (application.applicant.toString() !== req.user.id) {
        return res.status(403).json({ error: "Forbidden. You cannot access this application." });
      }

      const populatedJob = application.job as PopulatedJob;

      const formattedApplication: HistoryApplication = {
        _id: application._id.toString(),
        job: {
          _id: populatedJob._id.toString(),
          role: populatedJob.role,
          venue: populatedJob.venue,
          date: populatedJob.date,
        },
        appliedAt: application.appliedAt.toISOString(),
        status: application.status as 'withdrawn',
      };

      res.status(200).json({ application: formattedApplication });
    } catch (error: unknown) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Failed to fetch application." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
