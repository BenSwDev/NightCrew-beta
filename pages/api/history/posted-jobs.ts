// pages/api/history/posted-jobs.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job, { IJob } from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

interface HistoryJob {
  _id: string;
  role: string;
  venue: string;
  location: { city: string; street?: string; number?: string };
  date: string;
  startTime: string;
  endTime: string;
  paymentType: string;
  paymentAmount: number;
  currency: string;
  description?: string;
  deletedAt?: string | null;
  isActive: boolean;
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

      // Fetch jobs that are deleted or expired
      const now = new Date();
      const historyJobs = await Job.find({
        createdBy: req.user.id,
        $or: [
          { deletedAt: { $ne: null } }, // Deleted jobs
          {
            $expr: {
              $lt: [
                {
                  $dateFromString: {
                    dateString: { $concat: ["$date", "T", "$endTime", ":00"] },
                  },
                },
                now,
              ],
            },
          }, // Expired jobs
        ],
      })
        .select("-createdBy")
        .lean<IJob[]>();

      // Format the jobs
      const formattedJobs: HistoryJob[] = historyJobs.map((job) => ({
        _id: (job._id as unknown as string),
        role: job.role,
        venue: job.venue,
        location: job.location,
        date: job.date,
        startTime: job.startTime,
        endTime: job.endTime,
        paymentType: job.paymentType,
        paymentAmount: job.paymentAmount,
        currency: job.currency,
        description: job.description,
        deletedAt: job.deletedAt ? job.deletedAt.toISOString() : null,
        isActive: job.isActive || false,
      }));

      res.status(200).json({ historyJobs: formattedJobs });
    } catch (error: unknown) {
      console.error("Error fetching history jobs:", error);
      res.status(500).json({ error: "Failed to fetch history jobs." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
