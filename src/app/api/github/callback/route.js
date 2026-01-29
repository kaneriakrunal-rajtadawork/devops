import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.model';
import jwt from 'jsonwebtoken';
import GLOBALS from '@/constants/globals.constants';
import { handleGithubCallback } from '@/services/github.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${GLOBALS.NEXT_AUTH_URL}/?error=github_auth_failed`);
    }

    const result = await handleGithubCallback(code, state);
     if(result.success) {
      // Redirect back to the app with success
      return NextResponse.redirect(`${GLOBALS.NEXT_AUTH_URL}/?success=github_connected&userId=${result.user.id}`);
     } else {
       console.error("GitHub callback handling failed:", result.error);
       return NextResponse.redirect(`${GLOBALS.NEXT_AUTH_URL}/?error=github_callback_failed`);
     }

  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(`${GLOBALS.NEXT_AUTH_URL}/?error=github_callback_error`);
  }
}
