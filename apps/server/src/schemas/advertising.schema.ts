import { z } from "zod"
import { idSchema, monthSchema, yearSchema } from "./common.schema"

// Media type enum
export const mediaTypeEnum = z.enum(["digital", "tv", "newspaper", "magazine", "outdoor", "radio", "other"])

// Advertising budget schemas
export const advertisingBudgetSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  year: yearSchema,
  month: monthSchema,
  plannedBudget: z.number().min(0),
  actualSpent: z.number().min(0),
  mediaType: mediaTypeEnum,
  notes: z.string().optional(),
})

export const advertisingBudgetUpdateSchema = advertisingBudgetSchema.partial().merge(idSchema)

export const advertisingBudgetQuerySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  year: yearSchema,
})

// Type exports for use in other files
export type MediaType = z.infer<typeof mediaTypeEnum>
export type AdvertisingBudget = z.infer<typeof advertisingBudgetSchema>
export type AdvertisingBudgetUpdate = z.infer<typeof advertisingBudgetUpdateSchema>
export type AdvertisingBudgetQuery = z.infer<typeof advertisingBudgetQuerySchema>