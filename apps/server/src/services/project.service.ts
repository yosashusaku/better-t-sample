import { TRPCError } from "@trpc/server"
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm"
import { db } from "../db"
import { organization } from "../db/schema/auth"
import { customer } from "../db/schema/customer"
import { project, projectMember } from "../db/schema/project"
import type { ProjectFilters } from "../db/schema/zod"

export interface ProjectWithDetails {
  id: string
  name: string
  description: string | null
  slug: string | null
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  organizationId: string | null
  customerId: string | null
  ownerId: string
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    displayName: string | null
  } | null
  organization: {
    id: string
    name: string
  } | null
  memberRole: "owner" | "admin" | "member" | "viewer"
}

export interface ProjectStats {
  total: number
  planning: number
  active: number
  on_hold: number
  completed: number
  cancelled: number
}

export namespace ProjectService {
  /**
   * Get list of active projects for a user
   */
  export async function getActiveProjectsForUser(userId: string): Promise<ProjectWithDetails[]> {
    const memberProjects = await db
      .select({
        project: project,
        customer: customer,
        organization: organization,
        memberRole: projectMember.role,
      })
      .from(project)
      .innerJoin(projectMember, eq(project.id, projectMember.projectId))
      .leftJoin(customer, eq(project.customerId, customer.id))
      .leftJoin(organization, eq(project.organizationId, organization.id))
      .where(
        and(
          eq(projectMember.userId, userId),
          inArray(project.status, ["planning", "active", "on_hold"])
        )
      )
      .orderBy(desc(project.updatedAt))

    return memberProjects.map((row) => ({
      ...row.project,
      customer: row.customer
        ? {
            id: row.customer.id,
            name: row.customer.name,
            displayName: row.customer.displayName,
          }
        : null,
      organization: row.organization
        ? {
            id: row.organization.id,
            name: row.organization.name,
          }
        : null,
      memberRole: row.memberRole as "owner" | "admin" | "member" | "viewer",
    }))
  }

  /**
   * Get filtered project list for a user
   */
  export async function getFilteredProjectsForUser(
    userId: string,
    filters: ProjectFilters
  ): Promise<{ items: ProjectWithDetails[]; total: number; limit: number; offset: number }> {
    const { status, search, organizationId, customerId, limit = 50, offset = 0 } = filters

    // Build where conditions
    const conditions = [eq(projectMember.userId, userId)]

    if (status && status.length > 0) {
      conditions.push(inArray(project.status, status))
    }

    if (search) {
      conditions.push(ilike(project.name, `%${search}%`))
    }

    if (organizationId) {
      conditions.push(eq(project.organizationId, organizationId))
    }

    if (customerId) {
      conditions.push(eq(project.customerId, customerId))
    }

    const projects = await db
      .select({
        project: project,
        customer: customer,
        organization: organization,
        memberRole: projectMember.role,
      })
      .from(project)
      .innerJoin(projectMember, eq(project.id, projectMember.projectId))
      .leftJoin(customer, eq(project.customerId, customer.id))
      .leftJoin(organization, eq(project.organizationId, organization.id))
      .where(and(...conditions))
      .orderBy(desc(project.updatedAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(project)
      .innerJoin(projectMember, eq(project.id, projectMember.projectId))
      .where(and(...conditions))

    return {
      items: projects.map((row) => ({
        ...row.project,
        customer: row.customer
          ? {
              id: row.customer.id,
              name: row.customer.name,
              displayName: row.customer.displayName,
            }
          : null,
        organization: row.organization
          ? {
              id: row.organization.id,
              name: row.organization.name,
            }
          : null,
        memberRole: row.memberRole as "owner" | "admin" | "member" | "viewer",
      })),
      total: count,
      limit,
      offset,
    }
  }

  /**
   * Get single project detail with membership check
   */
  export async function getProjectById(projectId: string, userId: string) {
    // Check if user is a member of the project
    const membership = await db
      .select()
      .from(projectMember)
      .where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, userId)))
      .limit(1)

    if (membership.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this project",
      })
    }

    const [projectData] = await db
      .select({
        project: project,
        customer: customer,
        organization: organization,
      })
      .from(project)
      .leftJoin(customer, eq(project.customerId, customer.id))
      .leftJoin(organization, eq(project.organizationId, organization.id))
      .where(eq(project.id, projectId))
      .limit(1)

    if (!projectData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      })
    }

    // Get project members
    const members = await db
      .select({
        id: projectMember.id,
        userId: projectMember.userId,
        role: projectMember.role,
        joinedAt: projectMember.joinedAt,
      })
      .from(projectMember)
      .where(eq(projectMember.projectId, projectId))

    return {
      ...projectData.project,
      customer: projectData.customer,
      organization: projectData.organization,
      members,
      currentUserRole: membership[0].role,
    }
  }

  /**
   * Get project statistics for a user
   */
  export async function getProjectStatsForUser(userId: string): Promise<ProjectStats> {
    // Get counts by status
    const statusCounts = await db
      .select({
        status: project.status,
        count: sql<number>`count(*)`,
      })
      .from(project)
      .innerJoin(projectMember, eq(project.id, projectMember.projectId))
      .where(eq(projectMember.userId, userId))
      .groupBy(project.status)

    const stats: ProjectStats = {
      total: 0,
      planning: 0,
      active: 0,
      on_hold: 0,
      completed: 0,
      cancelled: 0,
    }

    statusCounts.forEach((row) => {
      const status = row.status as keyof ProjectStats
      if (status in stats) {
        stats[status] = row.count
        stats.total += row.count
      }
    })

    return stats
  }

  /**
   * Check if user has access to project
   */
  export async function checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const membership = await db
      .select()
      .from(projectMember)
      .where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, userId)))
      .limit(1)

    return membership.length > 0
  }

  /**
   * Get user's role in project
   */
  export async function getUserRoleInProject(
    projectId: string,
    userId: string
  ): Promise<"owner" | "admin" | "member" | "viewer" | null> {
    const [membership] = await db
      .select({ role: projectMember.role })
      .from(projectMember)
      .where(and(eq(projectMember.projectId, projectId), eq(projectMember.userId, userId)))
      .limit(1)

    return membership?.role || null
  }
}
