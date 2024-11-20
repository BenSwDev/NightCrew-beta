// pages/api/applications/[id].ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import JobApplication from "@/models/JobApplication";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";

export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;
  const { id } = query; // Application ID

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid application ID." });
  }

  switch (method) {
    case "GET":
      try {
        const application = await JobApplication.findById(id).populate("job", "role venue date").lean();

        if (!application) {
          return res.status(404).json({ error: "Application not found." });
        }

        // Ensure the application belongs to the authenticated user
        if (application.applicant.toString() !== req.user.id) {
          return res.status(403).json({ error: "Forbidden. You cannot access this application." });
        }

        res.status(200).json({ application });
      } catch (error: unknown) {
        console.error("Error fetching application:", error);
        res.status(500).json({ error: "Failed to fetch application." });
      }
      break;

    case "DELETE":
      try {
        const application = await JobApplication.findById(id);

        if (!application) {
          return res.status(404).json({ error: "Application not found." });
        }

        // Ensure the authenticated user is the owner of the application
        if (application.applicant.toString() !== req.user.id) {
          return res.status(403).json({ error: "You are not authorized to delete this application." });
        }

        await application.deleteOne();

        res.status(200).json({ message: "Application deleted successfully." });
      } catch (error: unknown) {
        console.error("Error deleting application:", error);
        res.status(500).json({ error: "Failed to delete application." });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
});
