// pages/api/history/applications.ts
import type { NextApiRequest, NextApiResponse } from "next";
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
      // Fetch applications that are withdrawn by the user
      const historyApplications = await JobApplication.find({
        applicant: req.user.id,
        status: 'withdrawn',
      }).populate("job", "role venue date");

      const formattedApplications: HistoryApplication[] = historyApplications.map((app) => ({
        _id: app._id.toString(),
        job: {
          _id: (app.job as any)._id.toString(),
          role: (app.job as any).role,
          venue: (app.job as any).venue,
          date: (app.job as any).date,
        },
        appliedAt: app.appliedAt.toISOString(),
        status: app.status as 'withdrawn',
      }));

      res.status(200).json({ historyApplications: formattedApplications });
    } catch (error) {
      console.error("Error fetching history applications:", error);
      res.status(500).json({ error: "Failed to fetch history applications." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
