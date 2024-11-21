// pages/api/history/applications/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication, { IJobApplicationPopulated } from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import { IJob } from "@/models/Job";

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

      // Fetch the application by ID
      const application = await JobApplication.findById(id)
        .populate<{ job: IJob }>("job")
        .lean<IJobApplicationPopulated | null>();

      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      if (!application.job || typeof application.job === "string") {
        return res.status(500).json({ error: "Job details are not populated." });
      }

      // Format the application for the response
      const formattedApplication = {
        _id: (application._id as unknown as string),
        job: {
          _id: (application.job._id as unknown as string),
          role: application.job.role,
          venue: application.job.venue,
          location: application.job.location,
          date: application.job.date,
          startTime: application.job.startTime,
          endTime: application.job.endTime,
          paymentType: application.job.paymentType,
          paymentAmount: application.job.paymentAmount,
          currency: application.job.currency,
          description: application.job.description,
        },
        appliedAt: application.appliedAt.toISOString(),
        status: application.status,
      };

      res.status(200).json({ application: formattedApplication });
    } catch (error: unknown) {
      console.error("Error fetching application by ID:", error);
      res.status(500).json({ error: "Failed to fetch application." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
