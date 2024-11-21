// pages/api/jobs/[id].ts

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

      // Find the job by ID
      const job = await Job.findById(id)
        .populate("createdBy", "name email avatarUrl")
        .lean();

      if (!job) {
        return res.status(404).json({ error: "Job not found." });
      }

      // Type guard to ensure createdBy is properly populated
      if (!job.createdBy || typeof job.createdBy === "string") {
        throw new Error(`createdBy field not populated for job ID ${(job._id as unknown as string)}`);
      }

      const formattedJob = {
        _id: (job._id as unknown as string), // Convert _id to string
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
        createdBy: {
          _id: (job.createdBy._id as unknown as string), // Convert createdBy._id to string
          name: (job.createdBy as any).name, // Use "as any" to avoid strict type errors
          email: (job.createdBy as any).email,
          avatarUrl: (job.createdBy as any).avatarUrl,
        },
        isActive: job.isActive || false,
        deletedAt: job.deletedAt ? job.deletedAt.toISOString() : null,
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
