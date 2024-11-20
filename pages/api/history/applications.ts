// pages/api/history/applications.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import Job from "@/models/Job";
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

  await dbConnect();

  if (method === "GET") {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Use explicit type for query results
      const applications = await JobApplication.find({ applicant: req.user.id })
        .populate<{ job: Job }>("job")
        .sort({ appliedAt: -1 });

      const formattedApplications: HistoryApplication[] = applications.map((app) => ({
        _id: app._id.toString(),
        job: {
          _id: app.job._id.toString(),
          role: app.job.role,
          venue: app.job.venue,
          date: app.job.date,
        },
        appliedAt: app.appliedAt.toISOString(),
        status: app.status as 'withdrawn',
      }));

      res.status(200).json({ historyApplications: formattedApplications });
    } catch (error: unknown) {
      console.error("Error fetching history applications:", error);
      res.status(500).json({ error: "Failed to fetch history applications." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
