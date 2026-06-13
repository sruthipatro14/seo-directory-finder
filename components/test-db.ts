import { prisma } from '../lib/prisma';

async function main() {
  console.log('⏳ Attempting to connect to Neon PostgreSQL...');
  try {
    await prisma.$connect();
    console.log('✅ Success! Prisma successfully connected to the database.');
    
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('📊 Database handshake successful. Current time:', (result as any)[0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error Details:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();