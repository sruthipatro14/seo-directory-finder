import { prisma } from "./prisma";

/**
 * Simple script to verify PostgreSQL/Neon connection
 */
async function testConnection() {
  console.log("⏳ Testing database connection...");
  try {
    await prisma.$connect();
    
    // Perform a basic query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    
    console.log("✅ Connection successful!");
    console.log("Current Database Time:", (result as any)[0].current_time);
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();