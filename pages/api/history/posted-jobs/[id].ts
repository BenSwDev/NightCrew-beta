// pages/api/history/posted-jobs/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
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
        await job.deleteOne();
        return res.status(200).json({ message: "Job history entry deleted successfully." });
      } catch (error) {
        console.error("Error deleting job history entry:", error);
        return res.status(500).json({ error: "Failed to delete job history entry." });
      }
    default:
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
});
