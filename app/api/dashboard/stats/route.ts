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
    
    // Demo stats data
    const stats = {
      total_deposits: 5000.00,
      total_withdrawals: 500.00,
      active_investments: 2000.00,
      total_referrals: 12,
      level1_referrals: 8,
      level2_referrals: 4,
      referral_earnings: 150.00,
      growth_earnings: 300.00,
      monthly_growth: 6.0,
      referral_commission: 1.0,
      current_plan: 'Professional',
      next_payout: '2024-02-01T00:00:00.000Z'
    };
    
    return NextResponse.json({
      success: true,
      data: { stats }
    });
    
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    }, { status: 500 });
  }
}
