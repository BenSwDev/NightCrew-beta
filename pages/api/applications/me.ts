import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";
import type { IJob } from "@/models/Job";

type PopulatedJobApplication = Omit<IJobApplication, "job"> & {
  job: IJob;
};

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

  await dbConnect();

  if (method === "GET") {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. User information is missing." });
      }

      // Fetch and type applications
      const applications = (await JobApplication.find({ applicant: req.user.id })
        .populate("job", "role venue location date startTime endTime paymentType paymentAmount currency description")
        .sort({ appliedAt: -1 })
        .lean()) as PopulatedJobApplication[];

      // Map applications to API response format
      const formattedApplications: Application[] = applications.map((app) => ({
        _id: app._id.toString(),
        job: {
          _id: app.job._id.toString(),
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
      }));

      res.status(200).json({ applications: formattedApplications });
    } catch (error: unknown) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ error: "Failed to fetch applications." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
