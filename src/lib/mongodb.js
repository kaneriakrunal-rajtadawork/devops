import GLOBALS from '@/constants/globals.constants';
import mongoose from 'mongoose';

const MONGODB_URI = GLOBALS.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 1. If we are already connected, return the connection
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  // 2. If a connection is already being established, return that promise
  // This prevents multiple requests from spawning multiple connections
  if (cached.promise) {
    return cached.promise;
  }

  // 3. Otherwise, start a new connection
  const opts = {
    bufferCommands: true, // Keep this true for Next.js
    maxPoolSize: 10,      // Keep low (10 is enough for Lambda/Container)
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  console.log('🟡 [MongoDB] initializing connection...');

  cached.promise = mongoose.connect(MONGODB_URI, opts)
    .then((mongooseInstance) => {
      console.log('✅ [MongoDB] Connected successfully');
      return mongooseInstance;
    })
    .catch((err) => {
      console.error('❌ [MongoDB] Connection error:', err);
      // Only nullify promise if connection FAILED. 
      // Do not nullify on request timeouts.
      cached.promise = null; 
      throw err;
    });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
export const ObjectId = (id) => new mongoose.Types.ObjectId(id);
export { connectionStats };