import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization, user } from "./auth"
import { project, projectMember, projectMonth } from "./project"

// Enums for labor management
export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "intern",
])

export const salaryTypeEnum = pgEnum("salary_type", [
  "monthly",
  "hourly",
  "daily",
  "project_based",
  "commission",
])

export const timeEntryStatusEnum = pgEnum("time_entry_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "billed",
])

export const overtimeTypeEnum = pgEnum("overtime_type", [
  "regular",
  "overtime_1_25", // 1.25x rate
  "overtime_1_5", // 1.5x rate
  "overtime_2_0", // 2.0x rate (holiday/late night)
  "holiday",
  "weekend",
])

// Employee salary and rate management
export const employeeSalary = pgTable("employee_salary", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),

  // Employment details
  employmentType: employmentTypeEnum("employment_type").notNull().default("full_time"),
  salaryType: salaryTypeEnum("salary_type").notNull().default("monthly"),

  // Salary information
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),

  // Hourly rate calculation
  standardWorkHoursPerMonth: decimal("standard_work_hours_per_month", {
    precision: 6,
    scale: 2,
  }).default("160"), // 160h/month
  calculatedHourlyRate: decimal("calculated_hourly_rate", { precision: 10, scale: 2 }), // baseSalary / standardWorkHours

  // Additional compensation
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }), // Custom overtime rate
  allowances: decimal("allowances", { precision: 15, scale: 2 }).default("0"), // Transportation, housing, etc.
  bonusEligible: boolean("bonus_eligible").notNull().default(true),

  // Benefits and deductions
  socialInsurance: decimal("social_insurance", { precision: 15, scale: 2 }).default("0"),
  healthInsurance: decimal("health_insurance", { precision: 15, scale: 2 }).default("0"),
  pensionContribution: decimal("pension_contribution", { precision: 15, scale: 2 }).default("0"),

  // Effective period
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").notNull().default(true),

  // Grade and position
  jobTitle: text("job_title"),
  departmentId: text("department_id"), // Can be linked to department table later
  grade: text("grade"), // A1, A2, B1, etc.
  level: integer("level"), // 1-10

  // Approval
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),

  notes: text("notes"),

  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Project-specific hourly rates (can override standard rates)
export const projectMemberRate = pgTable("project_member_rate", {
  id: text("id").primaryKey(),
  projectMemberId: text("project_member_id")
    .notNull()
    .references(() => projectMember.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Rate information
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("JPY"),

  // Rate type and billing
  rateType: text("rate_type").notNull().default("standard"), // "standard", "discounted", "premium"
  isBillable: boolean("is_billable").notNull().default(true),
  clientBillableRate: decimal("client_billable_rate", { precision: 10, scale: 2 }), // Rate charged to client

  // Effective period
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),

  notes: text("notes"),

  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Time tracking and labor cost calculation
export const timeEntry = pgTable("time_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  projectMonthId: text("project_month_id").references(() => projectMonth.id, {
    onDelete: "set null",
  }),

  // Time details
  workDate: timestamp("work_date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  hoursWorked: decimal("hours_worked", { precision: 8, scale: 2 }).notNull(),

  // Work classification
  overtimeType: overtimeTypeEnum("overtime_type").notNull().default("regular"),
  isOvertime: boolean("is_overtime").notNull().default(false),
  isBillable: boolean("is_billable").notNull().default(true),

  // Cost calculation
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(), // hoursWorked * hourlyRate
  overtimeMultiplier: decimal("overtime_multiplier", { precision: 3, scale: 2 }).default("1.0"),

  // Work description
  description: text("description"),
  taskDescription: text("task_description"),

  // Status and approval
  status: timeEntryStatusEnum("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),

  // Billing information
  clientBillableRate: decimal("client_billable_rate", { precision: 10, scale: 2 }),
  clientBillableAmount: decimal("client_billable_amount", { precision: 15, scale: 2 }),
  isInvoiced: boolean("is_invoiced").notNull().default(false),
  invoiceId: text("invoice_id"), // Can be linked to invoice table

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Monthly labor cost summary by project
export const monthlyLaborCost = pgTable("monthly_labor_cost", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  projectMonthId: text("project_month_id")
    .notNull()
    .references(() => projectMonth.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Summary period
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12

  // Hours summary
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }).notNull(),
  regularHours: decimal("regular_hours", { precision: 8, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 8, scale: 2 }).default("0"),
  billableHours: decimal("billable_hours", { precision: 8, scale: 2 }).default("0"),

  // Cost summary
  totalLaborCost: decimal("total_labor_cost", { precision: 15, scale: 2 }).notNull(),
  regularCost: decimal("regular_cost", { precision: 15, scale: 2 }).default("0"),
  overtimeCost: decimal("overtime_cost", { precision: 15, scale: 2 }).default("0"),

  // Billing summary
  totalBillableAmount: decimal("total_billable_amount", { precision: 15, scale: 2 }).default("0"),
  invoicedAmount: decimal("invoiced_amount", { precision: 15, scale: 2 }).default("0"),

  // Rates used for calculation
  averageHourlyRate: decimal("average_hourly_rate", { precision: 10, scale: 2 }),
  averageBillableRate: decimal("average_billable_rate", { precision: 10, scale: 2 }),

  currency: text("currency").notNull().default("JPY"),

  // Generation metadata
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  generatedById: text("generated_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Attendance tracking (optional, for integration with time tracking)
export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Date and time
  workDate: timestamp("work_date").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  breakDuration: integer("break_duration").default(0), // minutes

  // Calculated hours
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }),
  regularHours: decimal("regular_hours", { precision: 8, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 8, scale: 2 }),

  // Status
  isAbsent: boolean("is_absent").notNull().default(false),
  isHoliday: boolean("is_holiday").notNull().default(false),
  leaveType: text("leave_type"), // "sick", "vacation", "personal", etc.

  // Location tracking
  clockInLocation: text("clock_in_location"),
  clockOutLocation: text("clock_out_location"),
  isRemoteWork: boolean("is_remote_work").notNull().default(false),

  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
