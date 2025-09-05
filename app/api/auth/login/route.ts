import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Demo mode - accept any valid email/password
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0],
      email,
      account_balance: 1000,
      total_earning: 150,
      rewards: 50,
      referral_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');
    
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: { user, token }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error.message
    }, { status: 500 });
  }
}
