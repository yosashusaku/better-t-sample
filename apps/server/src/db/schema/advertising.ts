import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user, organization } from "./auth"
import { project, projectMonth } from "./project"
import { customer } from "./customer"
import { vendor } from "./vendor"

// Enums for advertising management
export const mediaTypeEnum = pgEnum("media_type", [
  "online",
  "print",
  "broadcast",
  "outdoor",
  "social_media",
  "email",
  "event",
  "other",
])

export const platformEnum = pgEnum("platform", [
  "google_ads",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
  "line",
  "yahoo",
  "newspaper",
  "magazine",
  "tv",
  "radio",
  "billboard",
  "other",
])

export const campaignStatusEnum = pgEnum("campaign_status", [
  "planning",
  "pending_approval",
  "active",
  "paused",
  "completed",
  "cancelled",
])

export const budgetTypeEnum = pgEnum("ad_budget_type", [
  "daily",
  "weekly",
  "monthly",
  "campaign_total",
  "unlimited",
])

export const pricingModelEnum = pgEnum("pricing_model", [
  "cpm", // Cost per thousand impressions
  "cpc", // Cost per click
  "cpa", // Cost per action
  "cpv", // Cost per view
  "flat_rate",
  "subscription",
  "performance_based",
])

// Media channels/publications management
export const mediaChannel = pgTable("media_channel", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  mediaType: mediaTypeEnum("media_type").notNull(),
  platform: platformEnum("platform"),
  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "cascade" }),
  
  // Channel details
  description: text("description"),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  
  // Media specifications
  audience: text("audience"), // Target audience description
  circulation: integer("circulation"), // For print media
  monthlyImpressions: integer("monthly_impressions"), // For digital media
  demographics: text("demographics"), // JSON data
  
  // Pricing information
  standardPricingModel: pricingModelEnum("standard_pricing_model"),
  rateCard: text("rate_card"), // JSON with standard rates
  minimumSpend: decimal("minimum_spend", { precision: 15, scale: 2 }),
  
  // Vendor relationship
  vendorId: text("vendor_id").references(() => vendor.id, { onDelete: "set null" }),
  accountManagerName: text("account_manager_name"),
  accountManagerEmail: text("account_manager_email"),
  
  // Performance metrics
  averageROI: decimal("average_roi", { precision: 10, scale: 2 }),
  averageCTR: decimal("average_ctr", { precision: 10, scale: 4 }), // Click-through rate
  
  isActive: boolean("is_active").notNull().default(true),
  
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Advertising campaigns
export const advertisingCampaign = pgTable("advertising_campaign", {
  id: text("id").primaryKey(),
  campaignCode: text("campaign_code").unique().notNull(), // CAM-2024-001
  name: text("name").notNull(),
  description: text("description"),
  status: campaignStatusEnum("status").notNull().default("planning"),
  
  // Project and customer linking
  projectId: text("project_id")
    .references(() => project.id, { onDelete: "set null" }),
  customerId: text("customer_id")
    .references(() => customer.id, { onDelete: "set null" }),
  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "cascade" }),
  
  // Campaign timeline
  plannedStartDate: timestamp("planned_start_date").notNull(),
  plannedEndDate: timestamp("planned_end_date").notNull(),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  
  // Budget information
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }).notNull(),
  budgetType: budgetTypeEnum("budget_type").notNull().default("campaign_total"),
  currency: text("currency").notNull().default("JPY"),
  
  // Campaign objectives
  objectives: text("objectives"), // JSON array of objectives
  targetAudience: text("target_audience"),
  targetMetrics: text("target_metrics"), // JSON with KPI targets
  
  // Creative assets
  creativeAssets: text("creative_assets"), // JSON array of asset references
  landingPageUrl: text("landing_page_url"),
  
  // Campaign management
  campaignManagerId: text("campaign_manager_id")
    .references(() => user.id, { onDelete: "set null" }),
  
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Individual advertising placements
export const advertisingPlacement = pgTable("advertising_placement", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => advertisingCampaign.id, { onDelete: "cascade" }),
  mediaChannelId: text("media_channel_id")
    .notNull()
    .references(() => mediaChannel.id, { onDelete: "cascade" }),
  projectMonthId: text("project_month_id")
    .references(() => projectMonth.id, { onDelete: "set null" }),
  
  // Placement details
  placementName: text("placement_name").notNull(),
  placementType: text("placement_type"), // "banner", "video", "text", "sponsored", etc.
  
  // Schedule
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Pricing and cost
  pricingModel: pricingModelEnum("pricing_model").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(), // impressions, clicks, etc.
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  
  // Targeting
  targeting: text("targeting"), // JSON with targeting criteria
  adContent: text("ad_content"), // Ad copy or creative description
  
  // Performance targets
  targetImpressions: integer("target_impressions"),
  targetClicks: integer("target_clicks"),
  targetConversions: integer("target_conversions"),
  
  // Approval and booking
  isApproved: boolean("is_approved").notNull().default(false),
  approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  bookingReference: text("booking_reference"),
  
  // Vendor/purchase order
  vendorId: text("vendor_id").references(() => vendor.id, { onDelete: "set null" }),
  purchaseOrderId: text("purchase_order_id"), // Link to PO if exists
  
  notes: text("notes"),
  
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Advertising performance tracking
export const advertisingPerformance = pgTable("advertising_performance", {
  id: text("id").primaryKey(),
  placementId: text("placement_id")
    .notNull()
    .references(() => advertisingPlacement.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => advertisingCampaign.id, { onDelete: "cascade" }),
  
  // Reporting period
  reportDate: timestamp("report_date").notNull(),
  reportPeriod: text("report_period"), // "daily", "weekly", "monthly"
  
  // Performance metrics
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  
  // Calculated metrics
  ctr: decimal("ctr", { precision: 10, scale: 4 }), // Click-through rate
  conversionRate: decimal("conversion_rate", { precision: 10, scale: 4 }),
  cpm: decimal("cpm", { precision: 10, scale: 2 }), // Cost per thousand impressions
  cpc: decimal("cpc", { precision: 10, scale: 2 }), // Cost per click
  cpa: decimal("cpa", { precision: 10, scale: 2 }), // Cost per acquisition
  
  // Engagement metrics
  videoViews: integer("video_views"),
  videoCompletionRate: decimal("video_completion_rate", { precision: 5, scale: 2 }),
  engagementRate: decimal("engagement_rate", { precision: 10, scale: 4 }),
  
  // Cost and ROI
  spend: decimal("spend", { precision: 15, scale: 2 }).notNull(),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).default("0"),
  roi: decimal("roi", { precision: 10, scale: 2 }), // Return on investment percentage
  
  // Additional metrics (JSON for flexibility)
  customMetrics: text("custom_metrics"), // Platform-specific metrics
  
  dataSource: text("data_source"), // "manual", "api", "report"
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Media invoices and billing
export const mediaInvoice = pgTable("media_invoice", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  mediaChannelId: text("media_channel_id")
    .notNull()
    .references(() => mediaChannel.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id")
    .references(() => advertisingCampaign.id, { onDelete: "set null" }),
  
  // Invoice details
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  
  // Billing period
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  
  // Amount
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("JPY"),
  
  // Line items (JSON for flexibility)
  lineItems: text("line_items"), // JSON array of placement charges
  
  // Payment status
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  
  // Verification
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedById: text("verified_by_id").references(() => user.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at"),
  
  // Attachments
  invoiceFileUrl: text("invoice_file_url"),
  supportingDocuments: text("supporting_documents"), // JSON array
  
  notes: text("notes"),
  
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Monthly advertising spend summary
export const monthlyAdvertisingSpend = pgTable("monthly_advertising_spend", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .references(() => project.id, { onDelete: "cascade" }),
  projectMonthId: text("project_month_id")
    .references(() => projectMonth.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "cascade" }),
  
  // Period
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  
  // Spend by media type
  onlineSpend: decimal("online_spend", { precision: 15, scale: 2 }).default("0"),
  printSpend: decimal("print_spend", { precision: 15, scale: 2 }).default("0"),
  broadcastSpend: decimal("broadcast_spend", { precision: 15, scale: 2 }).default("0"),
  socialMediaSpend: decimal("social_media_spend", { precision: 15, scale: 2 }).default("0"),
  otherSpend: decimal("other_spend", { precision: 15, scale: 2 }).default("0"),
  
  // Total spend
  totalSpend: decimal("total_spend", { precision: 15, scale: 2 }).notNull(),
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }),
  budgetUtilization: decimal("budget_utilization", { precision: 5, scale: 2 }), // percentage
  
  // Performance summary
  totalImpressions: integer("total_impressions").default(0),
  totalClicks: integer("total_clicks").default(0),
  totalConversions: integer("total_conversions").default(0),
  averageCpm: decimal("average_cpm", { precision: 10, scale: 2 }),
  averageCpc: decimal("average_cpc", { precision: 10, scale: 2 }),
  
  currency: text("currency").notNull().default("JPY"),
  
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  generatedById: text("generated_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
})