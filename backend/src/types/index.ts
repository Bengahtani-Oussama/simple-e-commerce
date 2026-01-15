import { Request } from 'express';
import { Document } from 'mongoose';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

// User Document Interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  addresses: IAddress[];
  role: 'customer';
  isVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Admin Document Interface
export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  permissions: string[];
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Address Interface
export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  addressLine: string;
  postalCode?: string;
  isDefault: boolean;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

// Email Options
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}