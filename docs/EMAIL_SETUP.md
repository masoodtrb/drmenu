# Email Setup Guide

## Gmail Configuration

To fix the email authentication errors, you need to properly configure Gmail for SMTP access:

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings: https://myaccount.google.com/
- Navigate to Security → 2-Step Verification
- Enable 2-Factor Authentication if not already enabled

### 2. Generate an App Password

- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" as the app type
- Click "Generate"
- Copy the 16-character password

### 3. Set Environment Variables

Create a `.env.local` file in your project root with:

```env
# Email Configuration
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-16-character-app-password"
```

### 4. Important Notes

- **DO NOT** use your regular Gmail password
- **DO NOT** use your 2FA code
- **USE** the App Password generated in step 2
- Make sure `MAIL_USER` is your full Gmail address (e.g., `user@gmail.com`)

### 5. Test the Configuration

The application will now provide better error messages if authentication fails.

### Troubleshooting

If you still get authentication errors:

1. Verify 2FA is enabled
2. Verify you're using the App Password, not your regular password
3. Make sure the App Password was generated for "Mail" or "Other"
4. Check that your Gmail address is correct in `MAIL_USER`
