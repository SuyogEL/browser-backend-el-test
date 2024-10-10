import { z } from "zod";
import { objectIdRegex, uuidRegex } from "../utils/common";

export const removeSessionValidation = z.object({
  userId: z.string({ required_error: "User ID is required" })
    .regex(objectIdRegex, { message: "Invalid MongoDB ObjectId format" }),
  sessionId: z.string()
    .regex(uuidRegex, { message: "Invalid UUID format" }),
});
