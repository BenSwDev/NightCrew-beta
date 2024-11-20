// pages/api/history/posted-jobs/[id].ts
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import { authenticated, NextApiRequestWithUser } from "@/utils/middleware";


export default authenticated(async function handler(
  req: NextApiRequestWithUser,
  res: NextApiResponse
) {
  const { method, query } = req;
  const { id } = query; // Job ID

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job ID." });
  }

  const job = await Job.findById(id);

  if (!job) {
    return res.status(404).json({ error: "Job not found." });
  }

  // Ensure that the authenticated user is the owner of the job
  if (job.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ error: "You are not authorized to delete this job." });
  }

  switch (method) {
    case "DELETE":
      try {
        // Soft delete the job by setting deletedAt and isActive
        job.deletedAt = new Date();
        job.isActive = false;
        await job.save();
        return res.status(200).json({ message: "Job history entry deleted successfully." });
      } catch (error: unknown) {
        console.error("Error deleting job history entry:", error);
        res.status(500).json({ error: "Failed to delete job history entry." });
      }
      break;

    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
});
