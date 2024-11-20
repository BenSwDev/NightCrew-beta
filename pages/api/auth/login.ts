// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import User from "@/models/User"; // Removed 'IUser' from import
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";
import { serialize } from "cookie";
import axios from "axios"; // Ensure axios is imported if used

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    try {
      await dbConnect();

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Sign JWT token
      const token = signToken(user);

      // Serialize cookie with updated maxAge
      const serializedCookie = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400, // 24 hours
      });

      // Set token in cookies
      res.setHeader("Set-Cookie", serializedCookie);

      // Return user data excluding sensitive information
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      };

      return res.status(200).json({ user: userResponse });
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "Failed to log in." });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
