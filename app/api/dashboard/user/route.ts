import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication token required'
      }, { status: 401 });
    }
    
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userData = JSON.parse(decoded);
    
    // Demo user data
    const user = {
      id: userData.userId,
      name: userData.email.split('@')[0],
      email: userData.email,
      account_balance: 2500.00,
      total_earning: 450.00,
      rewards: 150.00,
      referral_code: 'DEMO123',
      referred_by: null,
      created_at: '2024-01-01T00:00:00.000Z',
      status: 'active',
      level: 'Professional',
      next_milestone: 'iPhone 16 Pro',
      progress_to_milestone: 65
    };
    
    return NextResponse.json({
      success: true,
      data: { user }
    });
    
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    }, { status: 500 });
  }
}
