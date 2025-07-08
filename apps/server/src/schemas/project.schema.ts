import { z } from "zod"
import { idSchema, monthSchema, monthlyStatusEnum, paginationSchema, projectStatusEnum, yearSchema } from "./common.schema"

// Project ID schema
export const projectIdSchema = idSchema

// Monthly project filters schema
export const monthlyProjectFiltersSchema = z.object({
  projectId: z.string().optional(),
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  status: z.array(monthlyStatusEnum).optional(),
})

// Project filters schema
export const projectFiltersSchema = z.object({
  status: z.array(projectStatusEnum).optional(),
  search: z.string().optional(),
  organizationId: z.string().optional(),
  customerId: z.string().optional(),
}).merge(paginationSchema)

// Type exports for use in other files
export type ProjectFilters = z.infer<typeof projectFiltersSchema>
export type MonthlyProjectFilters = z.infer<typeof monthlyProjectFiltersSchema>