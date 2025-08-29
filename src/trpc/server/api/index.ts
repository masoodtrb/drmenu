import {
  createCallerFactory,
  createContext,
  createTRPCRouter,
  getQueryClient,
} from "@/trpc/server";
import { testRouter } from "./router/test";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { authRouter } from "./router/auth";
import { profileRouter } from "./router/profile";
import { fileRouter } from "./router/file";
import { storeRouter } from "./router/store";
import { menuRouter } from "./router/menu";
import { subscriptionRouter } from "./router/subscription";

console.log("running");

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
