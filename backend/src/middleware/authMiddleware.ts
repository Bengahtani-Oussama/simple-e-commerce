import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';
import Admin from '../models/Admin';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JWTPayload;

    // Fetch user from database to get permissions
    let userPermissions: string[] = [];
    if (decoded.role !== 'customer') {
      const adminUser = await Admin.findById(decoded.id).select('permissions');
      if (adminUser) {
        userPermissions = adminUser.permissions;
      }
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: userPermissions,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};

// Middleware to check if user is customer
export const isCustomer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'customer') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.',
    });
    return;
  }
  next();
};

// Middleware to check if user is admin (any admin role)
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const adminRoles = ['admin' , 'super_admin', 'manager', 'staff', 'viewer'];
  if (!req.user?.role || !adminRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
    return;
  }
  next();
};

// Middleware to check specific permissions
export const hasPermission = (requiredPermissions: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userPermissions = req.user?.permissions || [];
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    const hasRequiredPermission = permissions.some(permission => userPermissions.includes(permission));

    if (!hasRequiredPermission) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required permission(s): ${permissions.join(', ')}`,
      });
      return;
    }
    next();
  };
};

// Middleware to check if user is super admin
export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Super admin role required.',
    });
    return;
  }
  next();
};
