import jwt from 'jsonwebtoken';
import GLOBALS from '@/constants/globals.constants';

export const verifyToken = (handler) => async (request, ...args) => {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 403 });
    }

    const decoded = jwt.verify(token, GLOBALS.JWT_SECRET);
    request.user = decoded; // Attach user payload to the request

    return handler(request, ...args);

  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}; 