import { Request, Response } from "express";
import { z } from "zod";
import { socketService } from "..";
import { redisClient } from "../lib/utils/redis";
import { removeSessionValidation } from "../lib/zod-validation/session-validation";


export const getAllSession = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const userId = req.query.userId as string | undefined;

    const keyPattern = userId ? `user:${userId}:session:*` : "user:*:session:*";

    const sessionKeys = await redisClient.keys(keyPattern);

    if (sessionKeys.length === 0) {
      return res.status(200).json({ message: "No active sessions found." });
    }

    const start = (page - 1) * limit;
    const paginatedKeys = sessionKeys.slice(start, start + limit);

    const sessionsData = await redisClient.mget(paginatedKeys);

    const sessions = paginatedKeys.map((key, index) => {
      const sessionData = sessionsData[index];
      return sessionData ? JSON.parse(sessionData) : null;
    });

    return res.status(200).json({
      sessions,
      total: sessionKeys.length,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeSession = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = removeSessionValidation.parse(req.body);

    socketService.logoutSession(userId, sessionId, (success) => {
      if (success) {
        return res.status(200).json({ message: "Session logged out successfully." });
      } else {
        return res.status(400).json({ message: "Session not found or already logged out." });
      }
    });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
