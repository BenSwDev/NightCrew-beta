// pages/api/applications/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import Job from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;
  const { id } = query;

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid application ID." });
  }

const application = await JobApplication.findById(id).populate("job");

if (!application) {
  return res.status(404).json({ error: "Application not found." });
}

if (!("createdBy" in application.job)) {
  return res.status(400).json({ error: "Job is not properly populated." });
}

if (!req.user) {
  return res.status(401).json({ error: "Unauthorized. User information is missing." });
}

// Ensure the authenticated user is the owner of the job
if (application.job.createdBy.toString() !== req.user.id) {
  return res.status(403).json({ error: "You are not authorized to update this application." });
}


  switch (method) {
    case "GET":
      // Return application details
      return res.status(200).json({ application });
    case "PUT":
      // Update application status (connect/decline)
      try {
        const { status } = req.body;

        if (!['connected', 'declined'].includes(status)) {
          return res.status(400).json({ error: "Invalid status. Must be 'connected' or 'declined'." });
        }

        // Ensure the authenticated user is the owner of the job
        if (application.job.createdBy.toString() !== req.user.id) {
          return res.status(403).json({ error: "You are not authorized to update this application." });
        }

        application.status = status;
        await application.save();

        return res.status(200).json({ application });
      } catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({ error: "Failed to update application status." });
      }
    case "DELETE":
      // Withdraw application
      try {
        // Ensure the authenticated user is the applicant
        if (application.applicant.toString() !== req.user.id) {
          return res.status(403).json({ error: "You are not authorized to withdraw this application." });
        }

        application.status = 'withdrawn';
        await application.save();

        return res.status(200).json({ message: "Application withdrawn successfully." });
      } catch (error) {
        console.error("Error withdrawing application:", error);
        return res.status(500).json({ error: "Failed to withdraw application." });
      }
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
});
