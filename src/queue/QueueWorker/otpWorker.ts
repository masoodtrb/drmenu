import { Worker } from 'bullmq';

import { redisConnection } from '@/database/redis';
import { isEmail, isMobile } from '@/lib/util/commonValidations';
import { sendEmail } from '@/lib/util/emailSender';
import UserVerifyIdentityEmail from '@/template/email/userVerification';

import { render } from '@react-email/components';

import { OtpJobData } from '../otpQueue';

const otpWorker = new Worker<OtpJobData>(
  'otp-queue',
  async job => {
    // Mock: Log OTP to console

    try {
      const { otp, userId, username } = job.data;
      if (isEmail(username)) {
        await sendEmail({
          to: username,
          subject: 'Dr.Menu OTP',
          html: await render(
            UserVerifyIdentityEmail({
              validationCode: otp,
            })
          ),
        });
      }
      if (isMobile(username)) {
        // TODO: implement send SMS
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
