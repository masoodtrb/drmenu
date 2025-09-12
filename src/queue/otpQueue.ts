import { GlobalQueue } from '.';

export interface OtpJobData {
  userId?: string;
  username: string;
  otp: string;
  type?: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET';
}

export class OtpQueue extends GlobalQueue<OtpJobData> {
  constructor() {
    super('otp-queue');
  }
}
