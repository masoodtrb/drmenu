/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC } from "@trpc/server";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";
import { makeQueryClient } from "../client/queryClient";
import otpWorker from "./queue/otpWorker";
import { prisma as db } from "./db";

// import { db } from "~/server/db";
// import { getUserAsAdmin } from "../supabase/supabaseClient";

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const headers = opts.headers;
  const authToken = headers.get("authorization");

  //   const { user } = authToken ? await getUserAsAdmin(authToken) : { user: null };
  return {
    ...opts,
    db,
    // user,
  };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  //   if (!ctx.user) {
  //     throw new TRPCError({
  //       code: "UNAUTHORIZED",
  //     });
  //   }

  return next({
    ctx: {
      //   user: ctx.user,
    },
  });
});

export const privateProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
export const createContext = cache(async () => {
  const heads = new Headers(await headers());
  const ckies = await cookies();
  const accessToken = ckies.get("access-token")?.value;

  if (accessToken) {
    heads.set("authorization", accessToken);
  }

  heads.set("x-trpc-source", "rsc");
  heads.set("cookie", ckies.toString());

  return createTRPCContext({
    headers: heads,
  });
});

export const createCallerFactory = t.createCallerFactory;

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
