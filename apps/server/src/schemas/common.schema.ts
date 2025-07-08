import { z } from "zod"

// Common validation schemas for reuse across domains
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// Common ID schemas
export const idSchema = z.object({
  id: z.string().min(1, "ID is required")
})

// Common date/time schemas
export const yearSchema = z.number().int().min(2020).max(2030)
export const monthSchema = z.number().int().min(1).max(12)

// Common status enums
export const monthlyStatusEnum = z.enum(["planned", "in_progress", "completed", "delayed", "on_hold", "cancelled"])
export const projectStatusEnum = z.enum(["planning", "active", "on_hold", "completed", "cancelled"])

// Type exports for use in other files
export type Pagination = z.infer<typeof paginationSchema>
export type MonthlyStatus = z.infer<typeof monthlyStatusEnum>
export type ProjectStatus = z.infer<typeof projectStatusEnum>