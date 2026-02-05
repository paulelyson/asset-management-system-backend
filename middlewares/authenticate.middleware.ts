import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Types } from 'mongoose';

export interface TokenData extends IUser {
  _id: Types.ObjectId;
  name: string;
  iat: number;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | string | TokenData;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'usjr_local';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const generateToken = (data: any) => jwt.sign(data, JWT_SECRET, { expiresIn: '10d' });
