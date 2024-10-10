import bcrypt from "bcrypt";
import CryptoJS from 'crypto-js';
import { Response } from "express";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { v4 as uuidv4 } from 'uuid';
import { DiviceInfo } from "../../types/models.types";
import { redisClient } from "./redis";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'elaunch-browser-test-encryption-key';

export const bcryptPassword = async (password: string) => {
  const saltRound = 10
  const hashedPassword = await bcrypt.hash(password, saltRound);
  return hashedPassword
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  const doesMatched = bcrypt.compare(password, hashedPassword);
  return doesMatched
}

export const generateOtp = (length: number) => {
  var chars = "0123456789";
  var otp = "";
  for (var i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
}

export const generateAccessToken = (id: unknown) => {
  const token = jwt.sign({
    id: id
  }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
  return token
}
export const generateRefreshToken = (id: unknown) => {
  const token = jwt.sign({
    id: id
  }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });
  return token
}


export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function createSession(user: any, deviceInfo: DiviceInfo, res: Response) {
  const sessionId = uuidv4();
  const sessionKey = `user:${user._id}:session:${sessionId}`;
  const sessions = await redisClient.keys(`user:${user._id}:session:*`);
  if (sessions.length >= 5) {
    return res.status(403).json({ message: "Session limit reached for this user." });
  } else {
    await redisClient.set(sessionKey, JSON.stringify({
      userId: user._id,
      email: user.email,
      name: user.username,
      sessionId: sessionId ?? "",
      deviceInfo
    }));
    await redisClient.expire(sessionKey, 4 * 60 * 60);
    const tokenData = {
      userId: user._id,
      sessionId: sessionId,
    };
    const encryptedToken = encrypt(JSON.stringify(tokenData));
    const userObjWithoutPassword = _.omit(user, ["password", "twoFactor"]);
    return res.status(201).json({ token: encryptedToken, userInfo: userObjWithoutPassword });
  }
}

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
