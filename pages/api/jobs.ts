// pages/api/jobs.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job, { IJob } from "@/models/Job";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import {
  parseISO,
  isAfter,
  startOfToday,
  endOfToday,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { FilterQuery } from "mongoose";
import axios from "axios";

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

      const { page = "1", limit = "10", search, excludePostedJobs, city, role, dateRange } = query;
      const jobsPerPage = parseInt(limit as string, 10);
      const currentPage = parseInt(page as string, 10);

      const filter: FilterQuery<IJob> = {};

      // Get current date and time
      const now = new Date();

      // Filter based on dateRange
      if (dateRange === "today") {
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        filter.date = {
          $eq: todayStart.toISOString().split("T")[0], // YYYY-MM-DD
        };
      } else if (dateRange === "tomorrow") {
        const tomorrow = addDays(now, 1);
        filter.date = {
          $eq: tomorrow.toISOString().split("T")[0],
        };
      } else if (dateRange === "this_week") {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Assuming week starts on Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        filter.date = {
          $gte: weekStart.toISOString().split("T")[0],
          $lte: weekEnd.toISOString().split("T")[0],
        };
      } else if (dateRange === "this_month") {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filter.date = {
          $gte: monthStart.toISOString().split("T")[0],
          $lte: monthEnd.toISOString().split("T")[0],
        };
      } else {
        // Default active jobs filter
        filter.$or = [
          { date: { $gt: now.toISOString().split("T")[0] } }, // Future dates
          {
            date: now.toISOString().split("T")[0],
            endTime: { $gt: now.toTimeString().split(" ")[0] },
          },
        ];
      }

      // Exclude jobs created by the authenticated user
      if (excludePostedJobs === "true") {
        filter.createdBy = { $ne: req.user.id };
      }

      // Exclude applied jobs
      if (search === "true") {
        const userId = req.user.id;

        // Find job IDs the user has applied to
        const appliedJobs = await JobApplication.find({ applicant: userId }).select("job");
        const appliedJobIds = appliedJobs.map((app) => app.job);

        filter._id = { $nin: appliedJobIds };
      }

      // Filter by city if provided
      if (city) {
        filter["location.city"] = city;
      }

      // Filter by role if provided
      if (role) {
        filter.role = role;
      }

      const totalJobs = await Job.countDocuments(filter);
      const jobs = await Job.find(filter)
        .populate("createdBy", "name email avatarUrl")
        .sort({ date: 1, startTime: 1 }) // Sort by date and time
        .skip((currentPage - 1) * jobsPerPage)
        .limit(jobsPerPage)
        .lean<IJob[]>();

      res.status(200).json({
        jobs: jobs.map((job) => ({
          ...job,
          _id: (job._id as unknown as string),
          createdBy: {
            ...job.createdBy,
            _id: (job.createdBy._id as unknown as string),
          },
        })),
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
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

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
        paymentAmount == null ||
        !currency
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Validate date and time
      const now = new Date();
      const jobEndDateTime = parseISO(`${date}T${endTime}:00`);
      if (!isAfter(jobEndDateTime, now)) {
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
        createdBy: req.user.id,
      });

      res.status(201).json({
        ...job.toObject(),
        _id: (job._id as unknown as string),
        createdBy: {
          ...job.createdBy,
          _id: (job.createdBy.toString() as unknown as string),
        },
      });
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
