import { authorizeWithGithub } from '@/services/github.service';
import { verifyToken } from '@/utils/verifyToken';
import { NextResponse } from 'next/server';

export const GET = verifyToken(async (req, { params }) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const auth = await authorizeWithGithub(userId);

    return NextResponse.json({
      auth,
      success: true,
    });
  } catch (error) {
    console.error('GitHub authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GitHub authorization' },
      { status: 500 }
    );
  }
});
