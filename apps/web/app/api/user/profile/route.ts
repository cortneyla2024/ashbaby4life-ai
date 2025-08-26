import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication using the request
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, avatar, aiPersona, theme } = body;

    // TODO: Update user profile in database
    // This would typically update the user record with the new profile data
    const updatedUser = {
      id: user.id,
      email: user.email,
      name: name || user.name,
      avatar: avatar || user.avatar,
      aiPersona: aiPersona || 'default',
      theme: theme || 'light'
    };

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        aiPersona: updatedUser.aiPersona,
        theme: updatedUser.theme,
      },
    });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
