import { ApiResponse } from "@/lib/api-response";
import { registerUser } from "@/services/user.service";
import User from '@/models/User.model';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';

/**
 * Seed test user if not present
 */
const seedUser = async () => {
  await connectDB();
  const userExists = await User.findByEmail('test@example.com');
  if (!userExists) {
    console.log('Test user not found, seeding...');
    const hashedPassword = await bcrypt.hash('Test@123', 12);
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });
    console.log('Test user seeded.');
  }
};

/**
 * POST /api/auth/signup - User registration
 */
export async function POST(request) {
  try {
    await seedUser(); // Seed user if not present

    const body = await request.json();
    const user = await registerUser(body);

    return ApiResponse.created(user, "User created successfully");
  } catch (error) {
    console.error('Signup Error:', error);
    return ApiResponse.error(error);
  }
} 