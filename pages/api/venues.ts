import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import Venue from "@/models/Venue";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { search } = req.query;
      let filter = {};
      if (search && typeof search === "string") {
        filter = { name: { $regex: search, $options: "i" } };
      }
      const venues = await Venue.find(filter).select("name");
      res.status(200).json({ venues });
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ error: "Failed to fetch venues" });
    }
  } else if (req.method === "POST") {
    try {
      const { name } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Venue name is required and must be a string." });
      }

      // Check if the venue already exists
      const existingVenue = await Venue.findOne({ name });
      if (existingVenue) {
        return res.status(400).json({ error: "Venue already exists." });
      }

      // Add the new venue
      const newVenue = await Venue.create({ name });
      res.status(201).json(newVenue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ error: "Failed to create venue" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
