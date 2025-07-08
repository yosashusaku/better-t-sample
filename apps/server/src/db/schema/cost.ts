import { decimal, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user, organization } from "./auth"
import { project, task } from "./project"

// Enums for cost management
export const costCategoryTypeEnum = pgEnum("cost_category_type", [
  "labor",
  "material", 
  "equipment",
  "subcontractor",
  "overhead",
  "travel",
  "software",
  "other",
])

export const expenseStatusEnum = pgEnum("expense_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paid",
])

export const budgetTypeEnum = pgEnum("budget_type", [
  "initial",
  "revised",
  "final",
])

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
])

// Cost categories for projects
export const costCategory = pgTable("cost_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: costCategoryTypeEnum("type").notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  parentCategoryId: text("parent_category_id"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Project budgets
export const projectBudget = pgTable("project_budget", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  costCategoryId: text("cost_category_id")
    .references(() => costCategory.id, { onDelete: "set null" }),
  budgetType: budgetTypeEnum("budget_type").notNull().default("initial"),
  plannedAmount: decimal("planned_amount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 15, scale: 2 }).default("0"),
  currency: text("currency").notNull().default("JPY"),
  notes: text("notes"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Expenses
export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => task.id, { onDelete: "set null" }),
  costCategoryId: text("cost_category_id")
    .references(() => costCategory.id, { onDelete: "set null" }),
  submittedById: text("submitted_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  status: expenseStatusEnum("status").notNull().default("draft"),
  expenseDate: timestamp("expense_date").notNull(),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Labor costs (time-based costing)
export const laborCost = pgTable("labor_cost", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => task.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  hours: decimal("hours", { precision: 8, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  workDate: timestamp("work_date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


// Client invoices
export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  description: text("description"),
  notes: text("notes"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Cost reports and analytics
export const costReport = pgTable("cost_report", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  reportName: text("report_name").notNull(),
  reportType: text("report_type").notNull(), // 'summary', 'detailed', 'variance'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }),
  totalActual: decimal("total_actual", { precision: 15, scale: 2 }),
  variance: decimal("variance", { precision: 15, scale: 2 }),
  currency: text("currency").notNull().default("JPY"),
  reportData: text("report_data"), // JSON data for detailed report
  generatedById: text("generated_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})