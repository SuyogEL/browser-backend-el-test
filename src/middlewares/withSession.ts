import { NextFunction, Request, Response } from 'express';
import { decrypt } from '../lib/utils/common';
import { redisClient } from '../lib/utils/redis';

async function withSession(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization as string;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decryptedToken = decrypt(token);
    if (!decryptedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsedToken = JSON.parse(decryptedToken);
    const userId = parsedToken.userId
    const sessionId = parsedToken.sessionId
    const sessionKey = `user:${userId}:session:${sessionId}`;
    const redisSession = await redisClient.get(sessionKey);
    if (!redisSession) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = userId;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSession;
