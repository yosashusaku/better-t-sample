import { protectedProcedure, publicProcedure, router } from "../lib/trpc"
import { projectRouter } from "./project"

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK"
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    }
  }),
  project: projectRouter,
})
export type AppRouter = typeof appRouter
