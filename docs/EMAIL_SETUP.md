# Email Setup Guide

## Development Setup (MailHog)

For local development, we use MailHog to capture and view emails without sending them to real recipients.

### 1. Start MailHog

```bash
# Start MailHog using Docker Compose
docker-compose --profile development up mailhog

# Or start all development services
docker-compose --profile development up
```

### 2. Access MailHog Web UI

- Open your browser and go to: http://localhost:8025
- All emails sent by your application will appear here
- You can view email content, headers, and attachments

### 3. Environment Configuration

Create a `.env.local` file with:

```env
NODE_ENV=development
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@drmenu.local
```

## Production Setup (Gmail)

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
# Email Configuration for Production
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### 4. Important Notes

- **DO NOT** use your regular Gmail password
- **DO NOT** use your 2FA code
- **USE** the App Password generated in step 2
- Make sure `EMAIL_USER` is your full Gmail address (e.g., `user@gmail.com`)

### 5. Test the Configuration

The application will now provide better error messages if authentication fails.

## Quick Start Commands

### Development

```bash
# Start MailHog for email testing
docker-compose --profile development up mailhog

# View emails at http://localhost:8025
```

### Production

```bash
# Start production services
docker-compose --profile production up
```

## Troubleshooting

### Development Issues

- Make sure MailHog is running: `docker-compose ps`
- Check MailHog logs: `docker-compose logs mailhog`
- Verify environment variables are set correctly

### Production Issues

If you still get authentication errors:

1. Verify 2FA is enabled
2. Verify you're using the App Password, not your regular password
3. Make sure the App Password was generated for "Mail" or "Other"
4. Check that your Gmail address is correct in `EMAIL_USER`
