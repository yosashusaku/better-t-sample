import { z } from "zod"

// Custom validation schemas for common use cases
export const projectIdSchema = z.object({
  id: z.string().min(1, "Project ID is required")
})

export const monthlyProjectFiltersSchema = z.object({
  projectId: z.string().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  month: z.number().int().min(1).max(12).optional(),
  status: z.array(z.enum(["planned", "in_progress", "completed", "delayed", "on_hold", "cancelled"])).optional(),
})

export const projectFiltersSchema = z.object({
  status: z.array(z.enum(["planning", "active", "on_hold", "completed", "cancelled"])).optional(),
  search: z.string().optional(),
  organizationId: z.string().optional(),
  customerId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// Type exports for use in other files
export type ProjectFilters = z.infer<typeof projectFiltersSchema>
export type MonthlyProjectFilters = z.infer<typeof monthlyProjectFiltersSchema>
export type Pagination = z.infer<typeof paginationSchema>