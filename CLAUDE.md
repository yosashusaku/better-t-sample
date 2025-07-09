# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **project management system** built with the Better-T-Stack, featuring multi-tenant organization support, project tracking, and advertising budget management. The application uses Japanese localization throughout the UI.

## Tech Stack

- **Frontend**: React 19 + TanStack Router + TailwindCSS + shadcn/ui
- **Backend**: Hono + tRPC + Node.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth with organization, passkey, and multi-session plugins
- **Build System**: Turborepo monorepo with pnpm workspaces
- **Linting/Formatting**: Biome

## Development Commands

### Primary Development
```bash
pnpm dev                 # Start all apps (web on :3000, server on :8787)
pnpm dev:web            # Start only frontend
pnpm dev:server         # Start only backend
```

### Database Operations
```bash
pnpm db:push            # Push schema changes to database
pnpm db:studio          # Open Drizzle Studio UI
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Apply migrations
```

### Build & Quality
```bash
pnpm build              # Build all applications
pnpm check-types        # TypeScript type checking
pnpm lint               # Biome linting
pnpm lint:fix           # Auto-fix linting issues
pnpm format             # Format code with Biome
```

## Architecture

### Monorepo Structure
```
apps/
├── server/             # Hono + tRPC API
└── web/               # React frontend
```

### Backend Architecture

**tRPC Router Organization:**
- Routes are organized by domain in `src/routers/`
- Each router file follows the pattern `domain.router.ts`
- Main router in `src/routers/index.ts` combines all domain routers

**Service Layer Pattern:**
- Business logic separated into `src/services/` with namespace pattern
- Example: `AdvertisingService.Budget.getMonthlyBudgets()`
- Services handle database operations and business rules

**Schema Organization:**
- **Database schemas**: `src/db/schema/` (Drizzle table definitions)
- **Validation schemas**: `src/schemas/` (Zod schemas organized by domain)
- Common validation patterns in `src/schemas/common.schema.ts`

**Key Service Namespaces:**
- `ProjectService`: Project CRUD, filtering, access control
- `AdvertisingService.Budget`: Monthly advertising budget management

### Frontend Architecture

**Component Organization:**
```
src/components/
├── advertising/        # Advertising-specific components
├── project/           # Project management components
└── ui/               # Shared UI components (shadcn/ui)
```

**State Management:**
- TanStack Query for server state
- React useState for local component state
- tRPC integration via custom proxy in `src/utils/trpc.ts`

**Routing:**
- File-based routing with TanStack Router
- Route files in `src/routes/`
- Dynamic routes: `project.$projectId.tsx`

**Type Safety:**
- Full end-to-end type safety with tRPC
- Shared types from server router via `RouterOutputs`

### Authentication & Authorization

**Better Auth Setup:**
- Multi-tenant organizations with teams
- Passkey support for passwordless auth
- Multi-session support (max 5 sessions)
- Row Level Security (RLS) patterns in services

**Access Control:**
- Organization-based access control
- User roles: owner, admin, member, viewer
- Service-layer authorization checks

### Database Schema

**Key Domain Tables:**
- **Auth**: `user`, `session`, `organization`, `account`
- **Projects**: `project`, `projectMember`, `projectMonth`
- **Advertising**: `advertisingCampaign`, `advertisingPlacement`, `monthlyAdvertisingSpend`
- **Business**: `customer`, `vendor`, `laborCost`

**Multi-tenant Pattern:**
- Most tables link to `organizationId` for tenant isolation
- Project access controlled through `projectMember` relationships

## Development Patterns

### Adding New Features
1. **Database**: Add tables to appropriate schema file in `src/db/schema/`
2. **Validation**: Create Zod schemas in `src/schemas/`
3. **Service**: Implement business logic using namespace pattern
4. **Router**: Add tRPC routes in domain-specific router file
5. **Frontend**: Create components and integrate with tRPC

### tRPC Usage Patterns
```typescript
// Backend router
export const domainRouter = router({
  methodName: protectedProcedure
    .input(zodSchema)
    .query/mutation(async ({ ctx, input }) => {
      return await DomainService.methodName(input, ctx.session.user.id)
    })
})

// Frontend usage
const { data } = trpc.domain.methodName.useQuery(params)
const mutation = trpc.domain.methodName.useMutation(options)
```

### Service Layer Pattern
```typescript
export namespace DomainService {
  export async function methodName(params: Type, userId: string) {
    // 1. Validate user access
    // 2. Perform business logic
    // 3. Return typed result
  }
}
```

## Environment Setup

### Required Environment Variables
**Server (.env):**
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Auth secret key
- `BETTER_AUTH_URL`: Auth base URL
- `CORS_ORIGIN`: Frontend URL for CORS

**Web (.env):**
- `VITE_SERVER_URL`: Backend API URL

### Database Setup
1. Ensure PostgreSQL is running
2. Create database and update `DATABASE_URL`
3. Run `pnpm db:push` to apply schema
4. Optionally run `pnpm db:studio` to view data

## Japanese Localization

The application is designed for Japanese users:
- All UI text is in Japanese
- Currency formatting uses JPY
- Date/time formatting follows Japanese conventions
- Database stores Japanese text in appropriate fields

## Important Notes

- **Port Configuration**: Web runs on port 3000, server on port 8787
- **Type Safety**: Always use tRPC for API calls to maintain type safety
- **Authorization**: All protected routes require user session validation
- **Schema Changes**: Use `pnpm db:push` for development, `db:migrate` for production
- **Code Style**: Biome handles all formatting and linting with specific rules for this project