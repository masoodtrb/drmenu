import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Configure the transporter for Gmail
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Your Gmail address
    pass: process.env.MAIL_PASS, // Your Gmail app password
  },
});

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
    return info;
  } catch (error) {
    throw error;
  }
}

export const verifyTransporter = async () => {
  try {
    await mailTransporter.verify();
    console.log("Mail Server is ready to take our messages");
  } catch (error) {
    throw error;
  }
};
