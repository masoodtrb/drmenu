import { sendOTPSMS, verifySmsService } from './smsSender';

// Test function to verify SMS service
export async function testSmsService() {
  try {
    console.log('Testing SMS service...');

    // Check if we're in sandbox mode
    const isSandbox = process.env.SMS_SANDBOX_MODE === 'true';
    if (isSandbox) {
      console.log('🔧 Running in SANDBOX mode - no actual SMS will be sent');
    }

    // Verify service connection
    await verifySmsService();

    // Test sending OTP SMS
    const testMobile = '09123456789'; // Test mobile number
    console.log(`\n📱 Testing OTP SMS to: ${testMobile}`);

    const result = await sendOTPSMS(testMobile, '123456', 'SIGNUP');
    console.log('✅ Test SMS completed:', result);

    console.log('\n🎉 SMS service test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ SMS service test failed:', error);
    return false;
  }
}

// Export for use in development/testing
export default testSmsService;
