import otpWorker from "./queue/QueueWorker/otpWorker";
import { verifyTransporter } from "./utils/emailSender";

const makeJobWorker = () => {
  if (otpWorker.isPaused()) otpWorker.run();
};

export const register = () => {
  makeJobWorker();
  verifyTransporter();
};
