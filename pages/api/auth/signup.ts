// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    try {
      await dbConnect();

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser: IUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Sign JWT token
      const token = signToken(newUser);

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
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      };

      return res.status(201).json({ user: userResponse });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
