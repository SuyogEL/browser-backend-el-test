import mongoose, { Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
}
export enum Size {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  XL = 'XL'
}
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface ITwoFactor {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  twoFactor: ITwoFactor;
}

export interface IHistory extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  title: string;
  description?: string;
  favicon?: string
  // action: HistoryAction;
}

export interface DiviceInfo {
  browser?: string,
  version?: string,
  os?: string,
  osVersion?: string,
  device?: string
}

export interface IDownloadHistory {
  userId: mongoose.Types.ObjectId;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
}
