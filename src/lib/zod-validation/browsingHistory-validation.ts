import { z } from "zod";
import { objectIdRegex } from "../utils/common";

export const searchHistoryValidation = z.object({
  url: z.string({ required_error: "URL is required" })
    .url({ message: "Invalid URL format" }),
  title: z.string().optional(),
  description: z.string().optional(),
  favicon: z.string().optional(),
});

export const removeHistoryValidation = z.object({
  historyId: z.string({ required_error: "History ID is required" })
    .regex(objectIdRegex, { message: "Invalid MongoDB ObjectId format" }),
});
