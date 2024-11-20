// pages/api/jobs/[id].ts
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
    return res.status(403).json({ error: "You are not authorized to modify this job." });
  }

  switch (method) {
    case "GET":
      // Return job details
      return res.status(200).json({ job });

    case "PUT":
      // Update job details
      try {
        const {
          role,
          venue,
          location,
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
          !location?.city ||
          !date ||
          !startTime ||
          !endTime ||
          !paymentType ||
          !paymentAmount ||
          !currency
        ) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        // Update fields
        job.role = role;
        job.venue = venue;
        job.location = {
          city: location.city,
          street: location.street || undefined,
          number: location.number || undefined,
        };
        job.date = date;
        job.startTime = startTime;
        job.endTime = endTime;
        job.paymentType = paymentType;
        job.paymentAmount = paymentAmount;
        job.currency = currency;
        job.description = description || undefined;

        await job.save();

        return res.status(200).json({ job });
      } catch (error: unknown) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: "Failed to update job." });
      }
      break;

    case "DELETE":
      // Soft delete the job by setting deletedAt and isActive
      try {
        job.deletedAt = new Date();
        job.isActive = false;
        await job.save();
        return res.status(200).json({ message: "Job deleted successfully." });
      } catch (error: unknown) {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: "Failed to delete job." });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
});
