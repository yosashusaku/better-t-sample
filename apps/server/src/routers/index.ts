import { protectedProcedure, publicProcedure, router } from "../lib/trpc"
import { advertisingRouter } from "./advertising.router"
import { projectRouter } from "./project.router"

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
  advertising: advertisingRouter,
  project: projectRouter,
})
export type AppRouter = typeof appRouter
