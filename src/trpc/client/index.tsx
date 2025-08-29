"use client";
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { makeQueryClient } from "./queryClient";
import { AppRouter } from "@/trpc/server/api";
import { getUrl, transformer } from "../shared";
import { TanStackReactQueryDevtools } from "@/components/TanStackReactQueryDevtools";
import { useUserStore } from "@/lib/store/userStore";

export const trpc = createTRPCReact<AppRouter>();
let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer,
          url: getUrl(),
          headers: () => {
            if (typeof window === 'undefined') return {};

            // Get current pathname
            const pathname = window.location.pathname;

            // Get token from Zustand store based on route
            const { getCurrentUser, _hasHydrated } = useUserStore.getState();

            // Wait for store to be rehydrated
            if (!_hasHydrated) {
              return {};
            }

            const { token } = getCurrentUser();

            return {
              ...(token && { authorization: `Bearer ${token}` }),
            };
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <TanStackReactQueryDevtools />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
