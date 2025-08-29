import { GlobalQueue } from ".";

export interface OtpJobData {
  userId?: string;
  username: string;
  otp: string;
}

export class OtpQueue extends GlobalQueue<OtpJobData> {
  constructor() {
    super("otp-queue");
  }
}
