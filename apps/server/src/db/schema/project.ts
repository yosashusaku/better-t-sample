import { decimal, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user, organization } from "./auth"
import { customer } from "./customer"

// Enums for project management
export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
])


export const projectRoleEnum = pgEnum("project_role", [
  "owner",
  "admin",
  "member",
  "viewer",
])

export const monthlyStatusEnum = pgEnum("monthly_status", [
  "planned",
  "in_progress",
  "completed",
  "delayed",
  "on_hold",
  "cancelled",
])

// Project table
export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").unique(),
  status: projectStatusEnum("status").notNull().default("planning"),
  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .references(() => customer.id, { onDelete: "set null" }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Project members table
export const projectMember = pgTable("project_member", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: projectRoleEnum("role").notNull().default("member"),
  
  // Labor cost calculation
  estimatedHourlyRate: decimal("estimated_hourly_rate", { precision: 10, scale: 2 }), // Estimated rate for this project
  actualHourlyRate: decimal("actual_hourly_rate", { precision: 10, scale: 2 }), // Rate from employeeSalary
  
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
})

// Monthly project management table
export const projectMonth = pgTable("project_month", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  
  // Month identification
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  monthLabel: text("month_label").notNull(), // "2024-01", "2024-02", etc.
  
  // Monthly status and progress
  status: monthlyStatusEnum("status").notNull().default("planned"),
  progressPercentage: integer("progress_percentage").notNull().default(0), // 0-100
  
  // Monthly planning
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  
  // Monthly budget and cost tracking
  plannedBudget: decimal("planned_budget", { precision: 15, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0"),
  currency: text("currency").notNull().default("JPY"),
  
  // Monthly deliverables and milestones
  plannedDeliverables: text("planned_deliverables"), // JSON array of deliverables
  completedDeliverables: text("completed_deliverables"), // JSON array
  milestones: text("milestones"), // JSON array of milestone objects
  
  // Monthly metrics
  plannedWorkHours: decimal("planned_work_hours", { precision: 8, scale: 2 }),
  actualWorkHours: decimal("actual_work_hours", { precision: 8, scale: 2 }).default("0"),
  teamSize: integer("team_size").default(0),
  
  // Monthly reports and notes
  summary: text("summary"), // Monthly summary report
  achievements: text("achievements"), // What was accomplished
  challenges: text("challenges"), // Issues and challenges faced
  nextMonthPlan: text("next_month_plan"), // Plan for next month
  
  // Quality and risk metrics
  qualityScore: integer("quality_score"), // 1-10 quality rating
  riskLevel: text("risk_level").default("low"), // "low", "medium", "high"
  riskFactors: text("risk_factors"), // JSON array of risk factors
  
  // Client and stakeholder feedback
  clientFeedback: text("client_feedback"),
  clientSatisfactionScore: integer("client_satisfaction_score"), // 1-10
  
  // Approval and sign-off
  isApproved: text("is_approved").notNull().default("false"),
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  
  // Audit fields
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  updatedById: text("updated_by_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Monthly project activities/events log
export const projectMonthActivity = pgTable("project_month_activity", {
  id: text("id").primaryKey(),
  projectMonthId: text("project_month_id")
    .notNull()
    .references(() => projectMonth.id, { onDelete: "cascade" }),
  
  // Activity details
  activityType: text("activity_type").notNull(), // "milestone", "deliverable", "meeting", "review", "issue"
  title: text("title").notNull(),
  description: text("description"),
  
  // Timing
  activityDate: timestamp("activity_date").notNull(),
  duration: integer("duration"), // in minutes
  
  // Relations
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Activity metadata
  priority: text("priority").default("medium"), // "low", "medium", "high"
  tags: text("tags"), // JSON array of tags
  attachments: text("attachments"), // JSON array of file references
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
})


