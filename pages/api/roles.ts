// pages/api/roles.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await dbConnect();
      const { search } = req.query;
      let filter = {};
      if (search && typeof search === "string") {
        filter = { role: { $regex: search, $options: "i" } };
      }
      const roles = await Job.find(filter).distinct("role");
      res.status(200).json({ roles });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
