// Duplicate NextAuth handler (moved to app/api/auth/[...nextauth]/route.ts)
// This file was creating an unnecessary import of next-auth outside the App Router.
// Keeping as a no-op to avoid accidental route exposure.
export {};