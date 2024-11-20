// pages/api/protected/data.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticated } from "@/utils/middleware";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Your protected logic here
  res.status(200).json({ data: "This is protected data." });
};

export default authenticated(handler);
