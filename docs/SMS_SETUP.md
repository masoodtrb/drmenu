# SMS Integration Setup Guide

This guide explains how to set up and use SMS functionality for store user authentication using sms.ir service.

## Prerequisites

1. An account with [sms.ir](https://sms.ir)
2. API key from sms.ir dashboard
3. A line number (شماره خط) from sms.ir

## Environment Variables

Add the following variables to your `.env` file:

### For Development (Sandbox Mode)

```env
# SMS.ir configuration SANDBOX
SMS_API_KEY=CNp3YcZgR6pme9r8pGmLxdgdUCIZlM0x0W58UNcMK4ppWU0J
SMS_LINE_NUMBER=10008663
SMS_SANDBOX_MODE=true
```

### For Production

```env
# SMS.ir configuration PRODUCTION
SMS_API_KEY=your_real_api_key_here
SMS_LINE_NUMBER=your_real_line_number_here
SMS_SANDBOX_MODE=false
```

### Getting Your API Key

1. Log in to your [sms.ir](https://sms.ir) account
2. Go to the API section in your dashboard
3. Generate a new API key
4. Copy the API key to your environment variables

### Getting Your Line Number

1. In your sms.ir dashboard, go to "شماره خط" (Line Numbers)
2. Copy your line number (usually starts with 1000)
3. Add it to your environment variables

## Sandbox Mode

For development and testing, the system supports **Sandbox Mode** which simulates SMS sending without actually sending real SMS messages.

### Benefits of Sandbox Mode:

- **No SMS costs** during development
- **No real SMS sent** to test numbers
- **Full functionality testing** without charges
- **Console logging** of SMS content for debugging

### How to Enable Sandbox Mode:

1. Set `SMS_SANDBOX_MODE=true` in your environment variables
2. Use the provided sandbox API key and line number
3. All SMS operations will be logged to console instead of being sent

### Sandbox Mode Output Example:

```
🔧 SANDBOX MODE - SMS would be sent:
📱 To: 09123456789
📝 OTP: 123456
📋 Type: SIGNUP
✅ SMS simulation completed (no actual SMS sent)
```

## Features

### Supported Operations

The SMS integration supports the following operations:

1. **User Registration (Signup)**
   - Users can register with mobile number
   - OTP is sent via SMS for verification

2. **User Login**
   - Users can login with mobile number
   - OTP can be sent via SMS for login

3. **Password Reset**
   - Users can reset password using mobile number
   - OTP is sent via SMS for verification

### Mobile Number Format

The system accepts Iranian mobile numbers in the following formats:

- `09123456789` (with 0)
- `+989123456789` (with +98)
- `989123456789` (without +)

#### Persian Number Support

The system automatically converts Persian/Farsi numbers to English numbers:

- `۰۹۱۲۳۴۵۶۷۸۹` → `09123456789`
- `+۹۸۹۱۲۳۴۵۶۷۸۹` → `+989123456789`
- `۹۸۹۱۲۳۴۵۶۷۸۹` → `989123456789`

This ensures compatibility with Iranian keyboards that may input Persian digits.

## Usage

### For Store Users

1. **Registration**: Enter your mobile number in the signup form
2. **Verification**: Check your SMS for the OTP code
3. **Login**: Use your mobile number to login
4. **Password Reset**: Use mobile number for password reset

### For Developers

#### Sending SMS Programmatically

```typescript
import { sendOTPSMS } from '@/lib/util/smsSender';

// Send OTP for signup
await sendOTPSMS('09123456789', '123456', 'SIGNUP');

// Send OTP for login
await sendOTPSMS('09123456789', '123456', 'LOGIN');

// Send OTP for password reset
await sendOTPSMS('09123456789', '123456', 'PASSWORD_RESET');
```

#### Testing SMS Service

```typescript
import { testSmsService } from '@/lib/util/testSms';

// Test the SMS service
await testSmsService();
```

## Error Handling

The system handles common SMS errors:

- **Invalid API Key**: Check your SMS_API_KEY
- **Insufficient Credit**: Recharge your sms.ir account
- **Invalid Mobile Number**: Ensure correct Iranian mobile format
- **Service Unavailable**: Check sms.ir service status

## Cost Considerations

- Each SMS has a cost based on your sms.ir plan
- OTP messages are typically charged per SMS
- Monitor your usage in the sms.ir dashboard

## Security Notes

1. **API Key Security**: Never commit your API key to version control
2. **Rate Limiting**: The system includes rate limiting for OTP requests
3. **OTP Expiry**: OTP codes expire after 3 minutes
4. **Mobile Validation**: Only valid Iranian mobile numbers are accepted

## Troubleshooting

### Common Issues

1. **SMS Not Received**
   - Check mobile number format
   - Verify API key and line number
   - Check sms.ir account balance

2. **Invalid API Key Error**
   - Regenerate API key in sms.ir dashboard
   - Update environment variables
   - Restart the application

3. **Insufficient Credit**
   - Recharge your sms.ir account
   - Check billing in sms.ir dashboard

### Testing

#### Test SMS Service

Use the test function to verify your setup:

```bash
# In your development environment
npm run dev
# Then test the SMS service via API
curl http://localhost:3000/api/test-sms
```

#### Test in Sandbox Mode

1. Set `SMS_SANDBOX_MODE=true` in your `.env` file
2. Run the test - you'll see console output instead of real SMS
3. Check the console for SMS simulation logs

#### Test in Production Mode

1. Set `SMS_SANDBOX_MODE=false` in your `.env` file
2. Use your real SMS.ir credentials
3. Run the test - actual SMS will be sent (costs apply)

## Support

For technical issues:

1. Check sms.ir documentation
2. Verify environment variables
3. Test with the provided test functions
4. Check application logs for detailed error messages
