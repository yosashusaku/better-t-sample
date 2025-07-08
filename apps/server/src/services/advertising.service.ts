import { and, eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { db } from "../db"
import { monthlyAdvertisingSpend } from "../db/schema/advertising"
import { project, projectMonth } from "../db/schema/project"
import type { AdvertisingBudget, AdvertisingBudgetQuery, AdvertisingBudgetUpdate } from "../schemas/advertising.schema"

export namespace AdvertisingService {
  /**
   * Advertising Budget Management
   */
  export namespace Budget {
    export async function getMonthlyBudgets(params: AdvertisingBudgetQuery, userId: string) {
      const { projectId, year } = params

      // First verify user has access to this project
      const userProject = await db
        .select()
        .from(project)
        .where(and(
          eq(project.id, projectId),
          eq(project.ownerId, userId)
        ))
        .limit(1)

      if (!userProject.length) {
        throw new Error("Project not found or access denied")
      }

      // Get monthly budgets for the year
      const budgets = await db
        .select()
        .from(monthlyAdvertisingSpend)
        .where(and(
          eq(monthlyAdvertisingSpend.projectId, projectId),
          eq(monthlyAdvertisingSpend.year, year)
        ))
        .orderBy(monthlyAdvertisingSpend.month)

      // Create array for all 12 months with default values
      const monthlyBudgets = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        const existingBudget = budgets.find((b) => b.month === month)
        
        return {
          id: existingBudget?.id || `${projectId}-${year}-${month}`,
          projectId,
          year,
          month,
          plannedBudget: existingBudget?.totalBudget ? Number(existingBudget.totalBudget) : 0,
          actualSpent: existingBudget?.totalSpend ? Number(existingBudget.totalSpend) : 0,
          variance: existingBudget 
            ? Number(existingBudget.totalSpend) - Number(existingBudget.totalBudget || 0)
            : 0,
          variancePercentage: existingBudget && existingBudget.totalBudget 
            ? ((Number(existingBudget.totalSpend) - Number(existingBudget.totalBudget)) / Number(existingBudget.totalBudget)) * 100
            : 0,
          mediaType: "digital", // Default media type
          notes: ""
        }
      })

      return monthlyBudgets
    }

    export async function saveMonthlyBudget(params: AdvertisingBudget, userId: string) {
      const { projectId, year, month, plannedBudget, actualSpent, mediaType, notes } = params

      // Verify user has access to this project
      const userProject = await db
        .select()
        .from(project)
        .where(and(
          eq(project.id, projectId),
          eq(project.ownerId, userId)
        ))
        .limit(1)

      if (!userProject.length) {
        throw new Error("Project not found or access denied")
      }

      // Get or create project month
      let projectMonthRecord = await db
        .select()
        .from(projectMonth)
        .where(and(
          eq(projectMonth.projectId, projectId),
          eq(projectMonth.year, year),
          eq(projectMonth.month, month)
        ))
        .limit(1)

      if (!projectMonthRecord.length) {
        const projectMonthId = nanoid()
        const monthLabel = `${year}-${month.toString().padStart(2, '0')}`
        await db.insert(projectMonth).values({
          id: projectMonthId,
          projectId,
          year,
          month,
          monthLabel,
          createdById: userId,
          updatedById: userId
        })
        
        // Re-fetch the created record to get all the fields
        projectMonthRecord = await db
          .select()
          .from(projectMonth)
          .where(eq(projectMonth.id, projectMonthId))
          .limit(1)
      }

      // Check if monthly advertising spend record exists
      const existingRecord = await db
        .select()
        .from(monthlyAdvertisingSpend)
        .where(and(
          eq(monthlyAdvertisingSpend.projectId, projectId),
          eq(monthlyAdvertisingSpend.year, year),
          eq(monthlyAdvertisingSpend.month, month)
        ))
        .limit(1)

      const budgetUtilization = plannedBudget > 0 ? (actualSpent / plannedBudget) * 100 : 0

      if (existingRecord.length) {
        // Update existing record
        await db.update(monthlyAdvertisingSpend)
          .set({
            totalBudget: plannedBudget.toString(),
            totalSpend: actualSpent.toString(),
            budgetUtilization: budgetUtilization.toString(),
            // Map media type to appropriate spend column
            ...(mediaType === "digital" && { onlineSpend: actualSpent.toString() }),
            ...(mediaType === "tv" && { broadcastSpend: actualSpent.toString() }),
            ...(mediaType === "newspaper" && { printSpend: actualSpent.toString() }),
            ...(mediaType === "magazine" && { printSpend: actualSpent.toString() }),
            ...(mediaType === "radio" && { broadcastSpend: actualSpent.toString() }),
            ...(mediaType === "other" && { otherSpend: actualSpent.toString() }),
            generatedAt: new Date(),
            generatedById: userId
          })
          .where(eq(monthlyAdvertisingSpend.id, existingRecord[0].id))
      } else {
        // Create new record
        await db.insert(monthlyAdvertisingSpend).values({
          id: nanoid(),
          projectId,
          projectMonthId: projectMonthRecord[0].id,
          organizationId: userProject[0].organizationId,
          year,
          month,
          totalBudget: plannedBudget.toString(),
          totalSpend: actualSpent.toString(),
          budgetUtilization: budgetUtilization.toString(),
          // Map media type to appropriate spend column
          ...(mediaType === "digital" && { onlineSpend: actualSpent.toString() }),
          ...(mediaType === "tv" && { broadcastSpend: actualSpent.toString() }),
          ...(mediaType === "newspaper" && { printSpend: actualSpent.toString() }),
          ...(mediaType === "magazine" && { printSpend: actualSpent.toString() }),
          ...(mediaType === "radio" && { broadcastSpend: actualSpent.toString() }),
          ...(mediaType === "other" && { otherSpend: actualSpent.toString() }),
          generatedById: userId,
          generatedAt: new Date()
        })
      }

      return {
        id: existingRecord.length ? existingRecord[0].id : `${projectId}-${year}-${month}`,
        projectId,
        year,
        month,
        plannedBudget,
        actualSpent,
        variance: actualSpent - plannedBudget,
        variancePercentage: plannedBudget > 0 ? ((actualSpent - plannedBudget) / plannedBudget) * 100 : 0,
        mediaType,
        notes
      }
    }

    export async function updateMonthlyBudget(params: AdvertisingBudgetUpdate, userId: string) {
      const { projectId, year, month, plannedBudget, actualSpent, mediaType, notes } = params

      if (!projectId || !year || !month) {
        throw new Error("Project ID, year, and month are required")
      }

      // Verify user has access to this project
      const userProject = await db
        .select()
        .from(project)
        .where(and(
          eq(project.id, projectId),
          eq(project.ownerId, userId)
        ))
        .limit(1)

      if (!userProject.length) {
        throw new Error("Project not found or access denied")
      }

      // Find existing record
      const existingRecord = await db
        .select()
        .from(monthlyAdvertisingSpend)
        .where(and(
          eq(monthlyAdvertisingSpend.projectId, projectId),
          eq(monthlyAdvertisingSpend.year, year),
          eq(monthlyAdvertisingSpend.month, month)
        ))
        .limit(1)

      if (!existingRecord.length) {
        throw new Error("Monthly advertising spend record not found")
      }

      const currentBudget = plannedBudget ?? Number(existingRecord[0].totalBudget || 0)
      const currentSpend = actualSpent ?? Number(existingRecord[0].totalSpend || 0)
      const budgetUtilization = currentBudget > 0 ? (currentSpend / currentBudget) * 100 : 0

      // Update the record
      await db.update(monthlyAdvertisingSpend)
        .set({
          ...(plannedBudget !== undefined && { totalBudget: plannedBudget.toString() }),
          ...(actualSpent !== undefined && { totalSpend: actualSpent.toString() }),
          budgetUtilization: budgetUtilization.toString(),
          generatedAt: new Date(),
          generatedById: userId
        })
        .where(eq(monthlyAdvertisingSpend.id, existingRecord[0].id))

      return {
        id: existingRecord[0].id,
        projectId,
        year,
        month,
        plannedBudget: currentBudget,
        actualSpent: currentSpend,
        variance: currentSpend - currentBudget,
        variancePercentage: currentBudget > 0 ? ((currentSpend - currentBudget) / currentBudget) * 100 : 0,
        mediaType: mediaType || "digital",
        notes: notes || ""
      }
    }
  }

  /**
   * Future advertising service methods can be added here
   * Example: Campaign management, Media channel management, etc.
   */
}
