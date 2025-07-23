import otpWorker from "./trpc/server/queue/otpWorker";

const makeJobWorker = () => {
  if (otpWorker.isPaused()) otpWorker.run();
};

export const register = () => {
  makeJobWorker();
};
