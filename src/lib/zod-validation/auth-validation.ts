import { z } from "zod";

export const roleEnum = z.enum(['ADMIN', 'USER']);

export const registerUserSchema = z.object({
  username: z.string({ required_error: "Username is required" }).min(1, { message: "Username cannot be empty" }),
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
  password: z.string({ required_error: "Password is required" }).min(6, { message: "Password must be at least 6 characters long" }),
  // profileImage: z.string().url({ message: "Profile image must be a valid URL" }).optional(),
  // role: roleEnum.optional(),
});

export const loginUserValidation = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
  password: z.string({ required_error: "Password is required" }).min(6, { message: "Password must be at least 6 characters long" }),
});

export const verify2faValidation = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
  code: z.string({ required_error: "Google Authenticator Code is required" }).min(6, { message: "Code Must Be 6 Digit" }),
});