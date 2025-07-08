import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { multiSession, organization } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import { db } from "../db"
import * as schema from "../db/schema/auth"

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: "Better-T Sample",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: "owner",
      membershipLimit: 100,
      team: {
        teamLimit: 10,
        teamMembershipLimit: 50,
        teamCreatorRole: "owner",
      },
    }),
    passkey({
      rpName: process.env.APP_NAME || "Better-T Sample",
      rpID: process.env.BETTER_AUTH_URL
        ? new URL(process.env.BETTER_AUTH_URL).hostname
        : "localhost",
      origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    }),
    multiSession({
      maximumSessions: 5,
    }),
  ],
})
