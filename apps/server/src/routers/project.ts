import { projectFiltersSchema, projectIdSchema } from "../db/schema/zod"
import { protectedProcedure, router } from "../lib/trpc"
import { ProjectService } from "../services/project.service"

export const projectRouter = router({
  // Get list of active projects
  list: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx
    const user = session.user

    return await ProjectService.getActiveProjectsForUser(user.id)
  }),

  // Get filtered project list
  filteredList: protectedProcedure
    .input(projectFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { session } = ctx
      const user = session.user

      return await ProjectService.getFilteredProjectsForUser(user.id, input)
    }),

  // Get single project detail
  get: protectedProcedure.input(projectIdSchema).query(async ({ ctx, input }) => {
    const { session } = ctx
    const user = session.user
    const { id } = input

    return await ProjectService.getProjectById(id, user.id)
  }),

  // Get project statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx
    const user = session.user

    return await ProjectService.getProjectStatsForUser(user.id)
  }),

  // Check project access
  hasAccess: protectedProcedure
    .input(projectIdSchema.pick({ id: true }).transform(data => ({ projectId: data.id })))
    .query(async ({ ctx, input }) => {
      const { session } = ctx
      const user = session.user
      const { projectId } = input

      return await ProjectService.checkProjectAccess(projectId, user.id)
    }),

  // Get user role in project
  getUserRole: protectedProcedure
    .input(projectIdSchema.pick({ id: true }).transform(data => ({ projectId: data.id })))
    .query(async ({ ctx, input }) => {
      const { session } = ctx
      const user = session.user
      const { projectId } = input

      return await ProjectService.getUserRoleInProject(projectId, user.id)
    }),
})
