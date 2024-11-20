// utils/middleware.ts
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { verifyToken, isTokenExpired, UserPayload } from "./auth";

export interface NextApiRequestWithUser extends NextApiRequest {
  user?: UserPayload;
}

export const authenticated = (handler: NextApiHandler) => {
  return async (req: NextApiRequestWithUser, res: NextApiResponse) => {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (isTokenExpired(token)) {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }

    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user;

    return handler(req, res);
  };
};
