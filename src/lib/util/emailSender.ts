import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Validate required environment variables
const validateEmailConfig = () => {
  if (!process.env.MAIL_USER) {
    throw new Error("MAIL_USER environment variable is required");
  }
  if (!process.env.MAIL_PASS) {
    throw new Error("MAIL_PASS environment variable is required");
  }
};

// Configure the transporter for Gmail
const createMailTransporter = () => {
  validateEmailConfig();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // This should be an App Password, not your regular password
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
  const mailOptions = {
    from: `Dr Menu <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Failed to send email:", error);

    // Provide helpful error messages
    if (error.code === "EAUTH") {
      throw new Error(
        "Email authentication failed. Please check:\n" +
          "1. Your Gmail username and password are correct\n" +
          "2. You're using an App Password (not your regular password)\n" +
          "3. 2-Factor Authentication is enabled on your Google account\n" +
          "4. The App Password is generated for 'Mail' or 'Other'"
      );
    }

    throw error;
  }
}

export const verifyTransporter = async () => {
  try {
    await mailTransporter.verify();
    console.log("✅ Mail Server is ready to take our messages");
  } catch (error: any) {
    console.error("❌ Mail Server verification failed:", error);

    if (error.code === "EAUTH") {
      console.error("\n🔧 To fix Gmail authentication issues:");
      console.error("1. Enable 2-Factor Authentication on your Google account");
      console.error(
        "2. Generate an App Password: https://myaccount.google.com/apppasswords"
      );
      console.error(
        "3. Use the App Password in your MAIL_PASS environment variable"
      );
      console.error("4. Make sure MAIL_USER is your full Gmail address");
    }

    throw error;
  }
};
