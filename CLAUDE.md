# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (runs PGlite database + Next.js with Turbopack)
- `npm run build` - Production build (runs database migrations automatically)
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts (.next, out, coverage)

### Code Quality & Validation
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run check:types` - TypeScript type checking (use Cmd+Shift+B in VSCode)
- `npm run check:deps` - Find unused dependencies with Knip
- `npm run check:i18n` - Validate translations completeness

### Testing
- `npm run test` - Unit tests with Vitest
- `npm run test:e2e` - E2E tests with Playwright
- `npm run storybook` - Storybook dev server (port 6006)
- `npm run storybook:test` - Run Storybook tests

### Database
- `npm run db:generate` - Generate migration after Schema.ts changes
- `npm run db:migrate` - Apply migrations manually
- `npm run db:studio` - Drizzle Studio at https://local.drizzle.studio

### Additional Tools
- `npm run build-stats` - Bundle analyzer
- `npm run commit` - Interactive Conventional Commits

## Architecture

### Tech Stack Core
- Next.js 15+ App Router with TypeScript
- DrizzleORM + PostgreSQL (PGlite locally)
- Clerk authentication with i18n
- Tailwind CSS 4
- Vitest + Playwright testing

### Project Structure
- `src/app/[locale]/` - App Router with internationalization
  - `(auth)/` - Protected routes (dashboard, user profile)
  - `(marketing)/` - Public pages
  - `api/` - API routes
- `src/models/Schema.ts` - Database schema (modify here → `npm run db:generate`)
- `src/libs/` - Third-party configurations (DB, Env, I18n, Arcjet)
- `src/utils/AppConfig.ts` - App configuration (contains FIXME markers)

### Key Patterns
- **Database changes**: Edit `Schema.ts` → `npm run db:generate` → restart dev
- **Migrations**: Auto-applied via `instrumentation.ts` on Next.js startup
- **Environment**: Type-safe with T3 Env in `src/libs/Env.ts`
- **Path aliases**: `@/*` maps to `src/*`
- **i18n**: English/French support with next-intl

### Development Notes
- Local development uses PGlite (in-memory PostgreSQL)
- Production requires `DATABASE_URL` and `CLERK_SECRET_KEY`
- Strict TypeScript with advanced type safety enabled
- Uses Conventional Commits (interactive via `npm run commit`)
- Arcjet security middleware for bot detection and WAF
