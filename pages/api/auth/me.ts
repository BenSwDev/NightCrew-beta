// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, isTokenExpired, UserPayload } from "@/utils/auth";
import dbConnect from "@/utils/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  if (isTokenExpired(token)) {
    return res.status(401).json({ message: "Token has expired. Please log in again." });
  }

  const userPayload: UserPayload | null = verifyToken(token);

  if (!userPayload) {
    return res.status(401).json({ message: "Invalid token." });
  }

  try {
    await dbConnect();

    const user = await User.findById(userPayload.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
