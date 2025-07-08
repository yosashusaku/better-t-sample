import { pgEnum, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { user, organization } from "./auth"

// Enums for customer management
export const customerTypeEnum = pgEnum("customer_type", [
  "individual",
  "company",
  "government",
  "nonprofit",
])

export const customerStatusEnum = pgEnum("customer_status", [
  "lead",
  "prospect",
  "active",
  "inactive",
  "archived",
])

export const contactTypeEnum = pgEnum("contact_type", [
  "primary",
  "billing",
  "technical",
  "sales",
  "support",
])

// Customer table
export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  customerType: customerTypeEnum("customer_type").notNull().default("company"),
  status: customerStatusEnum("status").notNull().default("lead"),
  organizationId: text("organization_id")
    .references(() => organization.id, { onDelete: "cascade" }),
  
  // Company information
  companyRegistrationNumber: text("company_registration_number"),
  taxId: text("tax_id"),
  website: text("website"),
  industry: text("industry"),
  
  // Contact information
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
  notes: text("notes"),
  tags: text("tags"), // JSON array of tags
  
  // Relationship information
  assignedToId: text("assigned_to_id").references(() => user.id, { onDelete: "set null" }),
  sourceChannel: text("source_channel"), // "website", "referral", "marketing", etc.
  
  // Preferences
  preferredLanguage: text("preferred_language").default("ja"),
  preferredCurrency: text("preferred_currency").default("JPY"),
  
  // Audit fields
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Customer contacts table
export const customerContact = pgTable("customer_contact", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id, { onDelete: "cascade" }),
  
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
  contactType: contactTypeEnum("contact_type").notNull().default("primary"),
  isPrimary: boolean("is_primary").notNull().default(false),
  
  // Communication preferences
  allowEmail: boolean("allow_email").notNull().default(true),
  allowSms: boolean("allow_sms").notNull().default(false),
  allowPhone: boolean("allow_phone").notNull().default(true),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Customer addresses table (for multiple addresses)
export const customerAddress = pgTable("customer_address", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id, { onDelete: "cascade" }),
  
  // Address type
  addressType: text("address_type").notNull(), // "billing", "shipping", "office", "warehouse"
  label: text("label"), // Custom label for the address
  
  // Address details
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Japan"),
  
  // Preferences
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Customer interactions/activities log
export const customerActivity = pgTable("customer_activity", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id, { onDelete: "cascade" }),
  
  // Activity details
  activityType: text("activity_type").notNull(), // "call", "email", "meeting", "note", "proposal"
  subject: text("subject").notNull(),
  description: text("description"),
  
  // Timing
  activityDate: timestamp("activity_date").notNull(),
  duration: text("duration"), // For calls, meetings (in minutes)
  
  // Relations
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => customerContact.id, { onDelete: "set null" }),
  
  // Follow-up
  followUpDate: timestamp("follow_up_date"),
  followUpCompleted: boolean("follow_up_completed").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Customer documents/files
export const customerDocument = pgTable("customer_document", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id, { onDelete: "cascade" }),
  
  // Document details
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size"),
  mimeType: text("mime_type"),
  
  // Document metadata
  documentType: text("document_type"), // "contract", "proposal", "invoice", "other"
  title: text("title"),
  description: text("description"),
  tags: text("tags"), // JSON array
  
  // Access control
  isConfidential: boolean("is_confidential").notNull().default(false),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
})