import {
  createCallerFactory,
  createContext,
  createTRPCRouter,
  getQueryClient,
} from "@/trpc/server";
import { testRouter } from "./router/test";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

export const appRouter = createTRPCRouter({
  test: testRouter,
});

export type AppRouter = typeof appRouter;

const caller = createCallerFactory(appRouter)(createContext);
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
