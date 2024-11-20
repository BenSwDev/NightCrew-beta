import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { search } = req.query;

      // Mocked example of filtering cities
      const availableCities = ["New York", "Tel Aviv", "Berlin", "London", "Paris"];
      const filteredCities =
        typeof search === "string"
          ? availableCities.filter((city) =>
              city.toLowerCase().includes(search.toLowerCase())
            )
          : availableCities;

      res.status(200).json({ cities: filteredCities });
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ error: "Failed to fetch cities" });
    }
  } else if (req.method === "POST") {
    try {
      const { name } = req.body;

      // Basic validation for city name
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "City name is required and must be a string." });
      }

      // For now, simply return the provided city as successful
      res.status(201).json({ name });
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ error: "Failed to create city" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
