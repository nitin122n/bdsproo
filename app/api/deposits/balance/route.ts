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
    
    // Demo balance data
    const balance = {
      account_balance: 2500.00,
      available_balance: 2000.00,
      locked_balance: 500.00,
      total_earnings: 450.00,
      referral_earnings: 150.00,
      growth_earnings: 300.00,
      pending_deposits: 0.00,
      pending_withdrawals: 500.00,
      currency: 'USDT'
    };
    
    return NextResponse.json({
      success: true,
      data: { balance }
    });
    
  } catch (error: any) {
    console.error('Get balance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get balance',
      error: error.message
    }, { status: 500 });
  }
}
