// pages/api/jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import { parseISO, isAfter } from "date-fns";
import type { FilterQuery } from "mongoose";
import axios from "axios"; // Ensure axios is imported

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query, user } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const { page = 1, limit = 10, search, excludePostedJobs } = query;
      const jobsPerPage = parseInt(limit as string, 10);
      const currentPage = parseInt(page as string, 10);

      let filter: FilterQuery<typeof Job> = {};

      // Get current date and time
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().split(" ")[0];

      // Active jobs are those with date > currentDate
      // or date == currentDate and endTime > currentTime
      filter.$or = [
        { date: { $gt: currentDate } }, // Future dates
        {
          date: currentDate,
          endTime: { $gt: currentTime },
        },
      ];

      // Exclude jobs created by the authenticated user
      if (excludePostedJobs === "true") {
        filter.createdBy = { $ne: user.id };
      }

      if (search === "true") {
        const userId = user.id;

        // Find job IDs the user has applied to
        const appliedJobs = await JobApplication.find({ applicant: userId }).select("job");
        const appliedJobIds = appliedJobs.map((app) => app.job);

        filter._id = { $nin: appliedJobIds }; // Exclude applied jobs
      }

      const totalJobs = await Job.countDocuments(filter);
      const jobs = await Job.find(filter)
        .populate("createdBy", "name email avatarUrl")
        .sort({ date: 1, startTime: 1 }) // Sort by date and time
        .skip((currentPage - 1) * jobsPerPage)
        .limit(jobsPerPage);

      res.status(200).json({
        jobs,
        totalJobs, // Return totalJobs for accurate pagination
        currentPage,
      });
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "Failed to fetch jobs." });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  } else if (method === "POST") {
    try {
      const {
        role,
        venue,
        location: { city, street, number },
        date,
        startTime,
        endTime,
        paymentType,
        paymentAmount,
        currency,
        description,
      } = req.body;

      // Validate required fields
      if (
        !role ||
        !venue ||
        !city ||
        !date ||
        !startTime ||
        !endTime ||
        !paymentType ||
        !paymentAmount ||
        !currency
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Validate date and time
      const jobEndDateTime = parseISO(`${date}T${endTime}:00`);
      if (!isAfter(jobEndDateTime, new Date())) {
        return res.status(400).json({ error: "Job end time must be in the future." });
      }

      // Create new job
      const job = await Job.create({
        role,
        venue,
        location: { city, street, number },
        date,
        startTime,
        endTime,
        paymentType,
        paymentAmount,
        currency,
        description,
        createdBy: user.id,
      });

      res.status(201).json(job);
    } catch (error: unknown) {
      console.error("Error creating job:", error);
      if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "Failed to create job." });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
