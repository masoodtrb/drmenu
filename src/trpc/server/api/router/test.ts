import { createTRPCRouter, publicProcedure } from '../..';

export const testRouter = createTRPCRouter({
  getHello: publicProcedure.query(ctx => {
    return {
      message: 'hello masoud from trc',
    };
  }),
});
