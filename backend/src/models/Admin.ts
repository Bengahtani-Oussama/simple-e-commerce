import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAdmin } from '../types';

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      default: 'staff',
      enum: ['admin', 'super_admin', 'manager', 'staff', 'viewer'],
    },
    permissions: {
      type: [String],
      default: function (this: any) {
        // Set default permissions based on role
        const rolePermissions: { [key: string]: string[] } = {
          super_admin: ['manage_users', 'manage_products', 'manage_orders', 'manage_coupons', 'manage_brands', 'manage_categories', 'view_reports', 'manage_settings'],
          manager: ['manage_products', 'manage_orders', 'manage_coupons', 'manage_brands', 'manage_categories', 'view_reports'],
          staff: ['manage_orders', 'view_reports'],
          viewer: ['view_reports']
        };
        return rolePermissions[this.role] || [];
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);