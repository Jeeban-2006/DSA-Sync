import { headers } from 'next/headers';
import { verifyToken, getTokenFromHeader, TokenPayload } from './jwt';

export interface AuthResult {
  authenticated: boolean;
  user?: TokenPayload;
  error?: string;
}

export const authenticateRequest = async (): Promise<AuthResult> => {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return { authenticated: false, error: 'No authorization header' };
    }

    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return { authenticated: false, error: 'Invalid authorization format' };
    }

    const user = verifyToken(token);
    if (!user) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: 'Authentication failed' };
  }
};
