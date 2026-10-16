import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Admin';
}

const JWT_SECRET = process.env.JWT_SECRET || 'campus_sphere_jwt_super_secret_key_2025_education_platform';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as any;

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
