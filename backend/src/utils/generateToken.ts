import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { JWTPayload } from '../types';

export const generateAccessToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: Number(process.env.JWT_ACCESS_EXPIRY) || '15m',
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, options);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: Number(process.env.JWT_REFRESH_EXPIRY) || '7d',
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};