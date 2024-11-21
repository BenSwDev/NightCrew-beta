// pages/api/applications/me.ts

import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication, { IJobApplicationPopulated } from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

// Define the structure of the API response
interface Application {
  _id: string;
  job: {
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
  };
  appliedAt: string;
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
      // Ensure the user is authenticated
      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Unauthorized. User information is missing." });
      }

      // Fetch applications, populate the 'job' field, and sort by appliedAt
      const applications: IJobApplicationPopulated[] = await JobApplication.find({ applicant: req.user.id })
        .populate(
          "job",
          "role venue location date startTime endTime paymentType paymentAmount currency description"
        )
        .sort({ appliedAt: -1 })
        .lean<IJobApplicationPopulated[]>();

      // Map applications to the desired API response format
      const formattedApplications: Application[] = applications.map((app) => {
        // Type guard to ensure 'job' is populated
        if (!app.job || typeof app.job === "string") {
          throw new Error(`Job field not populated for application ID ${app._id}`);
        }

        return {
          _id: (app._id as unknown as string), // Ensure _id is converted to string
          job: {
            _id: (app.job._id as unknown as string), // Ensure job._id is converted to string
            role: app.job.role,
            venue: app.job.venue,
            location: app.job.location,
            date: app.job.date,
            startTime: app.job.startTime,
            endTime: app.job.endTime,
            paymentType: app.job.paymentType,
            paymentAmount: app.job.paymentAmount,
            currency: app.job.currency,
            description: app.job.description,
          },
          appliedAt: app.appliedAt.toISOString(),
        };
      });

      // Respond with the formatted applications
      res.status(200).json({ applications: formattedApplications });
    } catch (error: unknown) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ error: "Failed to fetch applications." });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
