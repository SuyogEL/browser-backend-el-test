
import { Request, Response } from "express";
import speakeasy from 'speakeasy';
import { z } from "zod";
import User from "../database/models/user.model";
import { bcryptPassword, comparePassword, createSession } from "../lib/utils/common";
import { redisClient } from "../lib/utils/redis";
import { loginUserValidation, registerUserSchema, verify2faValidation } from "../lib/zod-validation/auth-validation";


export async function registerUser(req: Request, res: Response) {
  try {
    const parsedReqBody = registerUserSchema.parse(req.body);

    const userExists = await User.findOne({ email: parsedReqBody.email }).lean().exec();
    if (userExists) {
      return res.status(400).json({ message: "User already has an account. Please log in directly." });
    }
    const hashedPassword = await bcryptPassword(parsedReqBody.password);

    const registeredUser = await User.create({
      ...parsedReqBody,
      password: hashedPassword,
    });

    if (!registeredUser) {
      return res.status(400).json({ message: "Failed to register user." });
    }
    const userData = await User.findById(registeredUser._id).select("-password").lean().exec();
    return res.status(201).json({ data: userData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const parsedReqBody = loginUserValidation.parse(req.body);
    const user = await User.findOne({ email: parsedReqBody.email }).lean().exec();
    const device = req.deviceInfo
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register before logging in." });
    }

    const isPasswordMatched = await comparePassword(parsedReqBody.password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    if (user.twoFactor.enabled) {
      return res.status(200).json({
        message: "2FA is enabled. Please provide your TOTP code.",
        requires2FA: true
      });
    }
    return createSession(user, device, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function verify2FA(req: Request, res: Response) {
  try {
    const { email, code } = verify2faValidation.parse(req.body);
    const user = await User.findOne({ email }).lean().exec();
    const device = req.deviceInfo
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (!user.twoFactor.enabled) {
      return res.status(403).json({ message: "2FA is not enabled for this user." });
    }
    const secret = user.twoFactor.secret || '';
    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code
    });
    if (!isVerified) {
      return res.status(400).json({ message: "Invalid 2FA Code." });
    }
    return createSession(user, device, res);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function enable2FA(req: Request, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFactor.secret = secret.base32;
    user.twoFactor.enabled = true;
    await user.save();
    const otpauth = `otpauth://totp/${user.username}?secret=${secret.base32}&issuer=YourAppName`;
    return res.status(200).json({
      message: "2FA has been enabled.",
      otpauth,
      secret: secret.base32,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function disable2FA(req: Request, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    user.twoFactor.secret = undefined;
    user.twoFactor.enabled = false;
    await user.save();
    return res.status(200).json({ message: "2FA has been disabled." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const logout = async (req: Request, res: Response) => {
  const sessionId = req.sessionId
  const userId = req.userId
  const sessionKey = `user:${userId}:session:${sessionId}`;
  const redisResponse = await redisClient.del(sessionKey);
  return res.status(201).json({ message: "Log Out Successfully" })
};

export const myAccount = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password").lean().exec();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}




