import { Worker } from 'bullmq';

import { redisConnection } from '@/database/redis';
import { isEmail, isMobile } from '@/lib/util/commonValidations';
import { sendEmail } from '@/lib/util/emailSender';
import { sendOTPSMS } from '@/lib/util/smsSender';
import PasswordResetEmail from '@/template/email/passwordReset';
import UserVerifyIdentityEmail from '@/template/email/userVerification';

import { render } from '@react-email/components';

import { OtpJobData } from '../otpQueue';

const otpWorker = new Worker<OtpJobData>(
  'otp-queue',
  async job => {
    try {
      const { otp, userId, username, type = 'SIGNUP' } = job.data;

      if (isEmail(username)) {
        let subject = 'Dr.Menu OTP';
        let emailTemplate;

        // Choose email template based on OTP type
        switch (type) {
          case 'PASSWORD_RESET':
            subject = 'بازیابی رمز عبور - Dr.Menu';
            emailTemplate = PasswordResetEmail({
              validationCode: otp,
              username: username,
            });
            break;
          case 'LOGIN':
            subject = 'ورود با کد تایید - Dr.Menu';
            emailTemplate = UserVerifyIdentityEmail({
              validationCode: otp,
            });
            break;
          case 'SIGNUP':
          default:
            subject = 'تایید حساب کاربری - Dr.Menu';
            emailTemplate = UserVerifyIdentityEmail({
              validationCode: otp,
            });
            break;
        }

        await sendEmail({
          to: username,
          subject: subject,
          html: await render(emailTemplate),
        });
      }

      if (isMobile(username)) {
        try {
          await sendOTPSMS(username, otp, type);
          console.log(
            `SMS OTP sent successfully to ${username} (Type: ${type})`
          );
        } catch (error) {
          console.error(`Failed to send SMS OTP to ${username}:`, error);
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
    // setTimeout(() => {
    //   console.log(
    //     `job ${job.id}: `,
    //     `Processing OTP for user ${job.data.username}: ${job.data.otp}`
    //   );
    // }, 5000);
    // Here you could send the OTP via SMS/email/etc.
  },
  {
    connection: redisConnection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);
otpWorker.on('ready', () => console.log('OTP job is ready'));
otpWorker.on('completed', job => {
  console.log(`OTP job ${job.id} completed`);
});

otpWorker.on('failed', (job, err) => {
  console.error(`OTP job ${job?.id} failed:`, err);
});

// Graceful shutdown - only in Node.js runtime

if (process.env.NEXT_RUNTIME === 'nodejs') {
  if (typeof process !== 'undefined') {
    process.on('SIGTERM', async () => {
      otpWorker.close();
      process.exit(0);
    });
  }
}

export default otpWorker;
