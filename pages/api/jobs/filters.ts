// pages/api/jobs/filters.ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import { isAxiosError } from "axios";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method } = req;

  // Only allow GET method
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  // Connect to the database
  await dbConnect();

  try {
    // Fetch unique cities and roles
    const cities = await Job.distinct("location.city");
    const roles = await Job.distinct("role");

    res.status(200).json({ cities, roles });
  } catch (error: unknown) {
    console.error("Error fetching filter options:", error);
    if (isAxiosError(error)) {
      res.status(500).json({ error: "Failed to fetch filter options." });
    } else {
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
});
