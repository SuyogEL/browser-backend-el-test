import { Schema, model } from 'mongoose';
import { IUser, UserRole } from '../../types/models.types';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: 'default-profile-image-url.jpg'
  },
  twoFactor: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
      required: false,
    },
    backupCodes: {
      type: [String],
      required: false,
    },
  },
  role: {
    type: String,
    enum: UserRole,
    default: UserRole.USER
  },
}, {
  timestamps: true
});

const User = model<IUser>('User', userSchema);
export default User;