import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In demo mode, create a mock Google user
    const mockUser = {
      id: `google_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Google User',
      email: 'user@gmail.com',
      account_balance: 1000,
      total_earning: 150,
      rewards: 50,
      referral_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    const token = Buffer.from(JSON.stringify({ userId: mockUser.id, email: mockUser.email })).toString('base64');
    
    // Redirect to dashboard with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/dashboard?token=${token}`;
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    }, { status: 500 });
  }
}
