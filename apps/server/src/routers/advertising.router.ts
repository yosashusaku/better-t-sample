import { protectedProcedure, router } from "../lib/trpc"
import { advertisingBudgetQuerySchema, advertisingBudgetSchema, advertisingBudgetUpdateSchema } from "../schemas/advertising.schema"
import { AdvertisingService } from "../services/advertising.service"

export const advertisingRouter = router({
  // Budget management
  budget: router({
    // Get monthly budgets for a year
    getMonthlyBudgets: protectedProcedure
      .input(advertisingBudgetQuerySchema)
      .query(async ({ ctx, input }) => {
        const { session } = ctx
        const user = session.user

        return await AdvertisingService.Budget.getMonthlyBudgets(input, user.id)
      }),

    // Save monthly budget
    saveMonthlyBudget: protectedProcedure
      .input(advertisingBudgetSchema)
      .mutation(async ({ ctx, input }) => {
        const { session } = ctx
        const user = session.user

        return await AdvertisingService.Budget.saveMonthlyBudget(input, user.id)
      }),

    // Update monthly budget
    updateMonthlyBudget: protectedProcedure
      .input(advertisingBudgetUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        const { session } = ctx
        const user = session.user

        return await AdvertisingService.Budget.updateMonthlyBudget(input, user.id)
      }),
  }),

  /**
   * Future advertising routes can be added here
   * Example: 
   * campaign: router({ ... }),
   * mediaChannel: router({ ... }),
   * performance: router({ ... }),
   */
})
