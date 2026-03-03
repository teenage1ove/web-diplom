import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/database';
import { UnauthorizedError } from '../utils/errorHandler';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = verifyAccessToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        trainer: {
          select: { id: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid token');
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.trainer ? 'trainer' : 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (roles.length && !roles.includes(req.user.role || '')) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
};
