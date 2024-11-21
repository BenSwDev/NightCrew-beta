import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/db";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, email, password, phone, dob, gender, avatarColor } = req.body;

    // Validate input
    if (!name || !email || !password || !phone || !dob || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 18) {
      return res.status(400).json({ message: "You must be at least 18 years old to sign up." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    try {
      await dbConnect();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: IUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        dateOfBirth: new Date(dob),
        avatarUrl: `https://via.placeholder.com/150/${avatarColor.substring(1)}/fff.png?text=${name[0].toUpperCase()}`,
      });

      const token = signToken(newUser);

      const serializedCookie = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400,
      });

      res.setHeader("Set-Cookie", serializedCookie);

      return res.status(201).json({
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          gender: newUser.gender,
          dateOfBirth: newUser.dateOfBirth,
          avatarUrl: newUser.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
