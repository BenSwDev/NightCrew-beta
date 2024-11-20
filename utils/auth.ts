// utils/auth.ts
import jwt from "jsonwebtoken";
import { IUser } from "@/models/User";

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined.");
}

/**
 * Signs a JWT token using user information.
 * @param user - The Mongoose user document.
 * @returns A signed JWT token.
 */
export function signToken(user: IUser): string {
  const payload: UserPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verifies a JWT token and checks if it's expired.
 * @param token - The JWT token.
 * @returns The decoded payload or null if invalid or expired.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}

/**
 * Checks if a token has expired based on its payload.
 * @param token - The JWT token.
 * @returns Boolean indicating if the token has expired.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}
