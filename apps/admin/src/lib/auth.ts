import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Admin users are pre-created
  },
  // No registration capability - admins created via database only
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },
  plugins: [
    nextCookies(), // Must be last plugin
  ],
  secret: process.env.BETTER_AUTH_SECRET || "admin-secret-key-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "ADMIN",
        required: true,
      },
    },
  },
});