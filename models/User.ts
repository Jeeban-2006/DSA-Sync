import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  joinDate: Date;
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  level: number;
  xp: number;
  lastActiveDate?: Date;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalProblemsSolved: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    achievements: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
