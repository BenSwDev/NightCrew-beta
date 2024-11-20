// pages/api/history/applications/[id].ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

interface HistoryApplication {
  _id: string;
  job: {
    _id: string;
    role: string;
    venue: string;
    date: string;
  };
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

  if (method === "GET") {
    try {
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid application ID." });
      }

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

      const formattedApplication: HistoryApplication = {
        _id: application._id.toString(),
        job: {
          _id: (application.job as any)._id.toString(),
          role: (application.job as any).role,
          venue: (application.job as any).venue,
          date: (application.job as any).date,
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
