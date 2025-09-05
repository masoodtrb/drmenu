import {
  createCallerFactory,
  createContext,
  createTRPCRouter,
  getQueryClient,
} from '@/trpc/server';

import { createHydrationHelpers } from '@trpc/react-query/rsc';

import { authRouter } from './router/auth';
import { fileRouter } from './router/file';
import { menuRouter } from './router/menu';
import { profileRouter } from './router/profile';
import { storeRouter } from './router/store';
import { subscriptionRouter } from './router/subscription';
import { testRouter } from './router/test';

console.log('running');

export const appRouter = createTRPCRouter({
  test: testRouter,
  auth: authRouter,
  profile: profileRouter,
  file: fileRouter,
  store: storeRouter,
  menu: menuRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;

const caller = createCallerFactory(appRouter)(createContext);
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
