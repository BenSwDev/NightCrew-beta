// pages/api/my-jobs.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;

  // Connect to the database
  await dbConnect();

  if (method === "GET") {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      const { page = "1", limit = "10" } = query;
      const jobsPerPage = parseInt(limit as string, 10);
      const currentPage = parseInt(page as string, 10);

      const filter = { createdBy: req.user.id };

      const totalJobs = await Job.countDocuments(filter);
      const jobs = await Job.find(filter)
        .populate("createdBy", "name email avatarUrl")
        .sort({ date: 1, startTime: 1 }) // Sort jobs by date and time
        .skip((currentPage - 1) * jobsPerPage)
        .limit(jobsPerPage)
        .lean();

      const formattedJobs = jobs.map((job) => ({
        ...job,
        _id: (job._id as unknown as string),
        createdBy: {
          ...job.createdBy,
          _id: (job.createdBy._id as unknown as string),
        },
      }));

      res.status(200).json({
        jobs: formattedJobs,
        totalPages: Math.ceil(totalJobs / jobsPerPage),
        currentPage,
      });
    } catch (error: unknown) {
      console.error("Error fetching my jobs:", error);
      res.status(500).json({ error: "Failed to fetch your jobs." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
