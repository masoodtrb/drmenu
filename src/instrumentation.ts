import { verifyTransporter } from './lib/util/emailSender';
import otpWorker from './queue/QueueWorker/otpWorker';

const makeJobWorker = () => {
  if (otpWorker.isPaused()) otpWorker.run();
};

export const register = () => {
  // Only run in Node.js runtime, not Edge Runtime
  if (typeof process !== 'undefined') {
    makeJobWorker();
    verifyTransporter();
  }
};
