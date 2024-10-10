import { z } from "zod";
import { objectIdRegex } from "../utils/common";

export const logDownloadHistoryValidation = z.object({
  url: z.string({ required_error: "URL is required" })
    .url({ message: "Invalid URL format" }),
  fileName: z.string({ required_error: "File Name Required" }),
  fileSize: z.number({ required_error: "File Size Required" }),
  mimeType: z.string().optional(),
});

export const removeDownloadHistoryValidation = z.object({
  historyId: z.string({ required_error: "History ID is required" })
    .regex(objectIdRegex, { message: "Invalid MongoDB ObjectId format" }),
});
