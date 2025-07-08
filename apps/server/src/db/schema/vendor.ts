import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization, user } from "./auth"
import { project, projectMonth } from "./project"

// Enums for vendor management
export const vendorTypeEnum = pgEnum("vendor_type", [
  "individual",
  "company",
  "agency",
  "freelancer",
  "consultant",
])

export const vendorStatusEnum = pgEnum("vendor_status", [
  "prospect",
  "active",
  "inactive",
  "blacklisted",
  "archived",
])

export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "pending_approval",
  "active",
  "completed",
  "terminated",
  "expired",
])

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "acknowledged",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
])

export const paymentTermsEnum = pgEnum("payment_terms", [
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "advance_payment",
  "upon_delivery",
  "milestone_based",
])

// Vendor master table
export const vendor = pgTable("vendor", {
  id: text("id").primaryKey(),
  vendorCode: text("vendor_code").unique().notNull(), // VEN001, VEN002, etc.
  name: text("name").notNull(),
  displayName: text("display_name"),
  vendorType: vendorTypeEnum("vendor_type").notNull().default("company"),
  status: vendorStatusEnum("status").notNull().default("prospect"),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),

  // Company information
  companyRegistrationNumber: text("company_registration_number"),
  taxId: text("tax_id"),
  website: text("website"),
  industry: text("industry"),

  // Contact information
  primaryContactName: text("primary_contact_name"),
  email: text("email"),
  phone: text("phone"),
  fax: text("fax"),

  // Address information
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").default("Japan"),

  // Business information
  description: text("description"),
  specialties: text("specialties"), // JSON array of specialties
  certifications: text("certifications"), // JSON array of certifications

  // Financial information
  preferredCurrency: text("preferred_currency").default("JPY"),
  defaultPaymentTerms: paymentTermsEnum("default_payment_terms").default("net_30"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),

  // Relationship information
  assignedToId: text("assigned_to_id").references(() => user.id, { onDelete: "set null" }),
  sourceChannel: text("source_channel"), // "referral", "website", "trade_show", etc.

  // Performance tracking
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // 1.00-5.00
  totalProjects: integer("total_projects").default(0),
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }), // percentage

  // Audit fields
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Vendor contacts table
export const vendorContact = pgTable("vendor_contact", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),

  // Contact information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"), // Job title
  department: text("department"),

  // Contact details
  email: text("email"),
  phone: text("phone"),
  mobile: text("mobile"),

  // Contact type and preferences
  contactType: text("contact_type").notNull().default("general"), // "general", "technical", "billing", "sales"
  isPrimary: boolean("is_primary").notNull().default(false),

  // Communication preferences
  allowEmail: boolean("allow_email").notNull().default(true),
  allowSms: boolean("allow_sms").notNull().default(false),
  allowPhone: boolean("allow_phone").notNull().default(true),

  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Contracts with vendors
export const vendorContract = pgTable("vendor_contract", {
  id: text("id").primaryKey(),
  contractNumber: text("contract_number").unique().notNull(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),

  // Contract details
  title: text("title").notNull(),
  description: text("description"),
  status: contractStatusEnum("status").notNull().default("draft"),
  contractType: text("contract_type"), // "service", "consulting", "development", "maintenance"

  // Financial terms
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  paymentTerms: paymentTermsEnum("payment_terms").notNull().default("net_30"),

  // Timeline
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),

  // Deliverables and milestones
  deliverables: text("deliverables"), // JSON array of deliverables
  milestones: text("milestones"), // JSON array of milestone objects

  // Terms and conditions
  terms: text("terms"), // Contract terms and conditions
  sla: text("sla"), // Service Level Agreement details

  // Contract management
  signedById: text("signed_by_id").references(() => user.id, { onDelete: "set null" }),
  signedAt: timestamp("signed_at"),
  contractFileUrl: text("contract_file_url"),

  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Purchase orders
export const purchaseOrder = pgTable("purchase_order", {
  id: text("id").primaryKey(),
  poNumber: text("po_number").unique().notNull(), // PO-2024-001, etc.
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  projectMonthId: text("project_month_id").references(() => projectMonth.id, {
    onDelete: "set null",
  }),
  contractId: text("contract_id").references(() => vendorContract.id, { onDelete: "set null" }),

  // Order details
  title: text("title").notNull(),
  description: text("description"),
  status: purchaseOrderStatusEnum("status").notNull().default("draft"),

  // Financial information
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),

  // Timeline
  orderDate: timestamp("order_date").notNull(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),

  // Billing and payment
  paymentTerms: paymentTermsEnum("payment_terms").notNull(),
  invoiceReceived: boolean("invoice_received").notNull().default(false),
  invoiceNumber: text("invoice_number"),
  paymentDueDate: timestamp("payment_due_date"),
  paidAt: timestamp("paid_at"),

  // Order items (JSON for simplicity)
  items: text("items"), // JSON array of order items

  // Approval workflow
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),

  // Notes and attachments
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file references

  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Vendor performance evaluation
export const vendorEvaluation = pgTable("vendor_evaluation", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  purchaseOrderId: text("purchase_order_id").references(() => purchaseOrder.id, {
    onDelete: "set null",
  }),

  // Evaluation period
  evaluationPeriod: text("evaluation_period"), // "2024-Q1", "2024-01", "Project-ABC"
  evaluationDate: timestamp("evaluation_date").notNull(),

  // Performance metrics (1-5 scale)
  qualityRating: integer("quality_rating").notNull(), // 1-5
  timelinesRating: integer("timeliness_rating").notNull(), // 1-5
  communicationRating: integer("communication_rating").notNull(), // 1-5
  costEffectivenessRating: integer("cost_effectiveness_rating").notNull(), // 1-5
  overallRating: integer("overall_rating").notNull(), // 1-5

  // Detailed feedback
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  improvements: text("improvements"),
  wouldRecommend: boolean("would_recommend").notNull().default(true),

  // Evaluation metadata
  evaluatedById: text("evaluated_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Vendor documents/certificates
export const vendorDocument = pgTable("vendor_document", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),

  // Document details
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size"),
  mimeType: text("mime_type"),

  // Document metadata
  documentType: text("document_type"), // "certificate", "license", "contract", "proposal", "other"
  title: text("title"),
  description: text("description"),

  // Validity tracking
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  isExpired: boolean("is_expired").notNull().default(false),

  // Access control
  isConfidential: boolean("is_confidential").notNull().default(false),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})
