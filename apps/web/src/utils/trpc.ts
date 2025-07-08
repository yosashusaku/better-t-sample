import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { AppRouter } from "../../../server/src/routers"
import { queryClient } from "./query-client"
import { trpcClient } from "./trpc-client"

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

export type { RouterInputs, RouterOutputs } from "../types/trpc"
// Re-export commonly used utilities
export { queryClient } from "./query-client"
export { trpcClient } from "./trpc-client"
