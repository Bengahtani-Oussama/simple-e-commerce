import { Request } from 'express';
import { Document } from 'mongoose';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: any;
    email: string;
    role: 'admin' | 'customer' | 'super_admin' | 'manager' | 'staff' | 'viewer';
    permissions?: string[];
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
  role: 'super_admin' | 'manager' | 'staff' | 'viewer';
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
  role: 'admin' | 'customer' | 'super_admin' | 'manager' | 'staff' | 'viewer';
}

// Email Options
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isValid?: boolean; // Virtual field
}

export interface CouponFormData {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerCustomer: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  usedCoupons: number;
}

export interface CouponUsage {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discount: number;
  freeShipping: boolean;
}