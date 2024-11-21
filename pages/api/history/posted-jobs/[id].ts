// pages/api/history/posted-jobs/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job, { IJob } from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

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
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Find the job by ID and ensure it belongs to the user
      const job = await Job.findOne({ _id: id, createdBy: req.user.id })
        .select("-createdBy")
        .lean<IJob | null>();

      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      const formattedJob = {
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
      };

      res.status(200).json({ job: formattedJob });
    } catch (error: unknown) {
      console.error("Error fetching job by ID:", error);
      res.status(500).json({ error: "Failed to fetch job." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
