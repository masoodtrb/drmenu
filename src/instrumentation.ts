import otpWorker from "./queue/QueueWorker/otpWorker";
import { verifyTransporter } from "./utils/emailSender";

const makeJobWorker = () => {
  if (otpWorker.isPaused()) otpWorker.run();
};

export const register = () => {
  // Only run in Node.js runtime, not Edge Runtime
  if (typeof process !== "undefined") {
    makeJobWorker();
    verifyTransporter();
  }
};
