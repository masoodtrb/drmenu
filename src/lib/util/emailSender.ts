import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Validate required environment variables based on environment
const validateEmailConfig = () => {
  if (isDevelopment) {
    // In development, we use MailHog which doesn't require authentication
    return;
  }

  if (!process.env.EMAIL_USER) {
    throw new Error(
      'EMAIL_USER environment variable is required for production'
    );
  }
  if (!process.env.EMAIL_PASS) {
    throw new Error(
      'EMAIL_PASS environment variable is required for production'
    );
  }
};

// Configure the transporter based on environment
const createMailTransporter = () => {
  validateEmailConfig();

  if (isDevelopment) {
    // Use MailHog for development (no authentication required)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT || '1025'),
      secure: false, // MailHog doesn't use SSL
      // No auth object - MailHog doesn't require authentication
    });
  }

  // Use Gmail for production
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // This should be an App Password, not your regular password
    },
    // Add additional options for better reliability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // Gmail limit is 14 emails per second
  });
};

const mailTransporter = createMailTransporter();

export async function sendEmail({ to, subject, text, html }: SendMailOptions) {
  const fromEmail = isDevelopment
    ? process.env.EMAIL_FROM || 'noreply@drmenu.local'
    : process.env.EMAIL_USER;

  const mailOptions = {
    from: `Dr Menu <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully: ${info.messageId}${isDevelopment ? ' (via MailHog)' : ''}`
    );
    return info;
  } catch (error: any) {
    console.error('Failed to send email:', error);

    // Provide helpful error messages based on environment
    if (error.code === 'EAUTH' && !isDevelopment) {
      throw new Error(
        'Email authentication failed. Please check:\n' +
          '1. Your Gmail username and password are correct\n' +
          "2. You're using an App Password (not your regular password)\n" +
          '3. 2-Factor Authentication is enabled on your Google account\n' +
          "4. The App Password is generated for 'Mail' or 'Other'"
      );
    }

    if (isDevelopment) {
      console.error(
        'Make sure MailHog is running on the configured host and port'
      );
    }

    throw error;
  }
}

export const verifyTransporter = async () => {
  try {
    await mailTransporter.verify();
    console.log(
      `✅ Mail Server is ready to take our messages${isDevelopment ? ' (MailHog)' : ' (Gmail)'}`
    );
  } catch (error: any) {
    console.error('❌ Mail Server verification failed:', error);

    if (error.code === 'EAUTH' && !isDevelopment) {
      console.error('\n🔧 To fix Gmail authentication issues:');
      console.error('1. Enable 2-Factor Authentication on your Google account');
      console.error(
        '2. Generate an App Password: https://myaccount.google.com/apppasswords'
      );
      console.error(
        '3. Use the App Password in your EMAIL_PASS environment variable'
      );
      console.error('4. Make sure EMAIL_USER is your full Gmail address');
    }

    if (isDevelopment) {
      console.error('\n🔧 To fix MailHog connection issues:');
      console.error(
        '1. Make sure MailHog is running: docker-compose up mailhog'
      );
      console.error(
        '2. Check that EMAIL_HOST and EMAIL_PORT are correctly set'
      );
      console.error(
        '3. Verify MailHog is accessible at the configured host and port'
      );
    }

    throw error;
  }
};
