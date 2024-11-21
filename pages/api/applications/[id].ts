import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication, { IJobApplicationPopulated } from "@/models/JobApplication";
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

      // Find the application by ID and populate the job field
      const application = await JobApplication.findById(id)
        .populate({
          path: "job",
          select: "role venue location date startTime endTime paymentType paymentAmount currency description",
        })
        .lean<IJobApplicationPopulated | null>();

      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }

      // Type guard for populated `job`
      const job = application.job && typeof application.job !== "string" ? application.job : null;

      const formattedApplication = {
        _id: String(application._id), // Safely convert _id to string
        job: job
          ? {
              _id: String(job._id), // Safely convert _id to string
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
            }
          : null,
        appliedAt: application.appliedAt.toISOString(),
        status: application.status,
      };

      return res.status(200).json({ application: formattedApplication });
    } catch (error: unknown) {
      console.error("Error fetching application by ID:", error);
      res.status(500).json({ error: "Failed to fetch application." });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
