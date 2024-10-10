import { Session } from "express-session";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId: string,
      deviceInfo: {
        browser?: string,
        version?: string,
        os?: string,
        osVersion?: string,
        device?: string
      }
    }
  }
}
