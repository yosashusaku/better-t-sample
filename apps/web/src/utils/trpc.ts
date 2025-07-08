import { QueryCache, QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { inferRouterOutputs } from "@trpc/server"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { toast } from "sonner"
import type { AppRouter } from "../../../server/src/routers"

export type RouterOutputs = inferRouterOutputs<AppRouter>

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries()
          },
        },
      })
    },
  }),
})

const getBaseUrl = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL
  if (!serverUrl) {
    throw new Error("VITE_SERVER_URL environment variable is not set")
  }
  return serverUrl
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        } as RequestInit)
      },
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})
