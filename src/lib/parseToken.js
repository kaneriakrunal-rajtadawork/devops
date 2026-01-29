import GLOBALS from '@/constants/globals.constants';
import { jwtVerify } from 'jose';

const JWT_SECRET = GLOBALS.JWT_SECRET;
/**
 * Parses a Bearer token and returns the decoded payload.
 * @param {string} authorization - The Authorization header value ("Bearer <token>")
 * @returns {Promise<object|null>} Decoded token data or null if invalid
 */
export async function parseToken(token) {
    if (!token || !token.startsWith('Bearer ')) return null;
    token = token.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (err) {
        return null;
    }
}