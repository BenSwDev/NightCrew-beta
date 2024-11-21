// pages/api/history/applications.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication, { IJobApplicationPopulated } from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import { IJob } from "@/models/Job";

interface HistoryApplication {
  _id: string;
  job: {
    _id: string;
    role: string;
    venue: string;
    date: string;
  };
  appliedAt: string;
  status: "withdrawn";
}

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method } = req;

  // Connect to the database
  await dbConnect();

  if (method === "GET") {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      const applications = await JobApplication.find({ applicant: req.user.id })
        .populate<{ job: IJob }>("job")
        .sort({ appliedAt: -1 })
        .lean<IJobApplicationPopulated[]>();

      const formattedApplications: HistoryApplication[] = applications.map((app) => {
        if (!app.job || typeof app.job === "string") {
          throw new Error(`Job field not populated for application ID ${(app._id as unknown as string)}`);
        }

        return {
          _id: (app._id as unknown as string),
          job: {
            _id: (app.job._id as unknown as string),
            role: app.job.role,
            venue: app.job.venue,
            date: app.job.date,
          },
          appliedAt: app.appliedAt.toISOString(),
          status: "withdrawn",
        };
      });

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
