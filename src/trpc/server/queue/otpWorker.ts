import { Worker } from "bullmq";
import { connection } from "./connection";
import { OtpJobData } from "./otpQueue";

const otpWorker = new Worker<OtpJobData>(
  "otp-queue",
  async (job) => {
    // Mock: Log OTP to console

    setTimeout(() => {
      console.log(
        `job ${job.id}: `,
        `Processing OTP for user ${job.data.username}: ${job.data.otp}`
      );
    }, 5000);
    // Here you could send the OTP via SMS/email/etc.
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);
otpWorker.on("ready", () => console.log("OTP job is ready"));
otpWorker.on("completed", (job) => {
  console.log(`OTP job ${job.id} completed`);
});

otpWorker.on("failed", (job, err) => {
  console.error(`OTP job ${job?.id} failed:`, err);
});

export default otpWorker;
