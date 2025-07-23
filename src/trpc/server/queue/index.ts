import { Queue, QueueOptions, Job, JobsOptions } from "bullmq";
import { connection } from "./connection";

export class GlobalQueue<T> {
  public queue: Queue<T>;

  constructor(public queueName: string, options?: QueueOptions) {
    this.queue = new Queue<T>(queueName, {
      connection,
      ...options,
    });
  }

  async addJob(data: T, options?: JobsOptions) {
    // For simple use cases, BullMQ allows omitting the job name (defaults to '__default__')
    return this.queue.add(`__${this.queueName}__` as any, data as any, options);
  }
}
