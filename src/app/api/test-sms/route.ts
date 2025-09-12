import { NextRequest, NextResponse } from 'next/server';

import { testSmsService } from '@/lib/util/testSms';

export async function GET(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'SMS test endpoint is only available in development' },
        { status: 403 }
      );
    }

    const result = await testSmsService();

    return NextResponse.json({
      success: result,
      message: result
        ? 'SMS service is working correctly'
        : 'SMS service test failed',
    });
  } catch (error: any) {
    console.error('SMS test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SMS service test failed',
      },
      { status: 500 }
    );
  }
}
