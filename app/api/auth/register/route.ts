import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, referralCode } = body;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Passwords do not match'
      }, { status: 400 });
    }
    
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters'
      }, { status: 400 });
    }
    
    // Create user (demo mode)
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      account_balance: 0,
      total_earning: 0,
      rewards: 0,
      referral_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      referred_by: referralCode || null,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    // Generate JWT token
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      data: { user, token }
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error.message
    }, { status: 500 });
  }
}
