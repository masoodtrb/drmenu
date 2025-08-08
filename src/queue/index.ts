import { redisConnection, redisSubscriber } from "@/database/redis";
import { Queue, QueueOptions, JobsOptions, QueueEvents } from "bullmq";

export class GlobalQueue<T> {
  public queue: Queue<T>;
  public queueEvent: QueueEvents;
  private defaultQueueOptions = {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 1000 },
    },
  };
  constructor(public queueName: string, options?: QueueOptions) {
    this.queue = new Queue<T>(queueName, {
      ...this.defaultQueueOptions,
      ...options,
    });

    this.queueEvent = new QueueEvents(queueName, {
      connection: redisSubscriber,
    });
  }

  async addJob(data: T, options?: JobsOptions) {
    // For simple use cases, BullMQ allows omitting the job name (defaults to '__default__')
    return this.queue.add(`__${this.queueName}__` as any, data as any, options);
  }
}
