import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: unknown | string ; 
    email?: string;
    sessionId?: string;
  }
}