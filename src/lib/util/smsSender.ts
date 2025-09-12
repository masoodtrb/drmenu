import { Smsir } from 'sms-typescript/lib';

export interface SendSmsOptions {
  mobile: string;
  message: string;
  templateId?: number;
  parameters?: { name: string; value: string }[];
}

// Validate required environment variables
const validateSmsConfig = () => {
  if (!process.env.SMS_API_KEY) {
    throw new Error('SMS_API_KEY environment variable is required');
  }
  if (!process.env.SMS_LINE_NUMBER) {
    throw new Error('SMS_LINE_NUMBER environment variable is required');
  }
};

// Check if we're in sandbox mode
const isSandboxMode = () => {
  return process.env.SMS_SANDBOX_MODE === 'true';
};

// Configure the SMS service
const createSmsService = () => {
  validateSmsConfig();

  return new Smsir(
    process.env.SMS_API_KEY as string,
    parseInt(process.env.SMS_LINE_NUMBER as string, 10)
  );
};

const smsService = createSmsService();

export async function sendSMS({
  mobile,
  message,
  templateId,
  parameters,
}: SendSmsOptions) {
  try {
    let result;

    if (templateId && parameters) {
      // Send verification code with template
      result = await smsService.SendVerifyCode(mobile, templateId, parameters);
    } else {
      // Send regular SMS
      result = await smsService.SendBulk(message, [mobile], null, null);
    }

    console.log('SMS sent successfully:', result);
    return result;
  } catch (error: any) {
    console.error('Failed to send SMS:', error);

    // Provide helpful error messages
    if (error.message?.includes('Invalid API key')) {
      throw new Error(
        'SMS API key is invalid. Please check your SMS_API_KEY environment variable.'
      );
    }

    if (error.message?.includes('Insufficient credit')) {
      throw new Error(
        'Insufficient SMS credit. Please recharge your SMS account.'
      );
    }

    if (error.message?.includes('Invalid mobile number')) {
      throw new Error(
        'Invalid mobile number format. Please use a valid Iranian mobile number.'
      );
    }

    throw error;
  }
}

export async function sendOTPSMS(
  mobile: string,
  otp: string,
  type: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET' = 'SIGNUP'
) {
  try {
    // In sandbox mode, just log the SMS instead of sending it
    if (isSandboxMode()) {
      console.log('🔧 SANDBOX MODE - SMS would be sent:');
      console.log(`📱 To: ${mobile}`);
      console.log(`📝 OTP: ${otp}`);
      console.log(`📋 Type: ${type}`);
      console.log('✅ SMS simulation completed (no actual SMS sent)');

      // Return a mock success response
      return {
        success: true,
        message: 'SMS sent successfully (sandbox mode)',
        data: {
          mobile,
          otp,
          type,
          sandbox: true,
        },
      };
    }

    let message: string;

    switch (type) {
      case 'PASSWORD_RESET':
        message = `کد تایید بازیابی رمز عبور: ${otp}\nاین کد تا ۳ دقیقه معتبر است.\nDr.Menu`;
        break;
      case 'LOGIN':
        message = `کد تایید ورود: ${otp}\nاین کد تا ۳ دقیقه معتبر است.\nDr.Menu`;
        break;
      case 'SIGNUP':
      default:
        message = `کد تایید ثبت نام: ${otp}\nاین کد تا ۳ دقیقه معتبر است.\nDr.Menu`;
        break;
    }

    return await sendSMS({
      mobile,
      message,
    });
  } catch (error: any) {
    console.error('Failed to send OTP SMS:', error);
    throw error;
  }
}

export const verifySmsService = async () => {
  try {
    if (isSandboxMode()) {
      console.log('🔧 SANDBOX MODE - SMS Service verification:');
      console.log('✅ SMS Service is ready (sandbox mode)');
      console.log(
        '📱 API Key:',
        process.env.SMS_API_KEY?.substring(0, 10) + '...'
      );
      console.log('📞 Line Number:', process.env.SMS_LINE_NUMBER);
      console.log('⚠️  No actual SMS will be sent in sandbox mode');
      return true;
    }

    const credit = await smsService.getCredit();
    console.log('✅ SMS Service is ready. Available credit:', credit);
    return true;
  } catch (error: any) {
    console.error('❌ SMS Service verification failed:', error);

    if (error.message?.includes('Invalid API key')) {
      console.error('\n🔧 To fix SMS authentication issues:');
      console.error('1. Get your API key from https://sms.ir');
      console.error('2. Set SMS_API_KEY in your environment variables');
      console.error('3. Set SMS_LINE_NUMBER in your environment variables');
      console.error('4. For development, set SMS_SANDBOX_MODE=true');
    }

    throw error;
  }
};

// Export the service instance for direct use if needed
export { smsService };
