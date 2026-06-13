import { PrismaClient, DaCategory } from '@prisma/client';

const prisma = new PrismaClient();

const INDUSTRIES = [
  "General Business",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Finance",
  "Education",
  "Marketing",
  "Legal"
];

const NAME_PARTS: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  "General Business": { prefixes: ["Biz", "Local", "Global", "Trade"], suffixes: ["Finder", "Directory", "Hub"] },
  "Technology": { prefixes: ["Tech", "SaaS", "Dev", "Cloud"], suffixes: ["Index", "List", "Grid"] },
  "Healthcare": { prefixes: ["Med", "Health", "Care", "Doc"], suffixes: ["Network", "Portal", "Finder"] },
  "Real Estate": { prefixes: ["Prop", "Home", "Realty", "Estate"], suffixes: ["Path", "Listings", "Direct"] },
  "Finance": { prefixes: ["Fin", "Bank", "Wealth", "Capital"], suffixes: ["Central", "Vault", "Advisor"] },
  "Education": { prefixes: ["Edu", "Uni", "Learn", "Course"], suffixes: ["Search", "Cat", "Base"] },
  "Marketing": { prefixes: ["Ad", "Growth", "Brand", "Social"], suffixes: ["Spot", "Agency", "Nexus"] },
  "Legal": { prefixes: ["Law", "Legal", "Lex", "Counsel"], suffixes: ["Connect", "Grid", "Bridge"] },
};

function categorizeDa(da: number): DaCategory {
  if (da <= 20) return DaCategory.Low;
  if (da <= 50) return DaCategory.Average;
  return DaCategory.Excellent;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Optional: Clear existing data if you want a clean start
  // await prisma.website.deleteMany({});
  // await prisma.searchHistory.deleteMany({});

  for (let i = 1; i <= 50; i++) {
    const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
    const parts = NAME_PARTS[industry] || NAME_PARTS["General Business"];
    
    const prefix = parts.prefixes[Math.floor(Math.random() * parts.prefixes.length)];
    const suffix = parts.suffixes[Math.floor(Math.random() * parts.suffixes.length)];
    const name = `${prefix}${suffix} ${i}`;
    
    // Generate a unique URL
    const url = `https://www.${prefix.toLowerCase()}${suffix.toLowerCase()}${i}.com`;
    
    const domainAuthority = Math.floor(Math.random() * 95) + 5; // 5 to 100
    const spamScore = Math.floor(Math.random() * 15); // 0 to 15
    const freeListing = Math.random() > 0.3; // 70% chance of free listing
    const active = Math.random() > 0.1; // 90% chance of being active

    await prisma.website.upsert({
      where: { url },
      update: {},
      create: {
        name,
        url,
        domainAuthority,
        spamScore,
        freeListing,
        industry,
        daCategory: categorizeDa(domainAuthority),
        active,
      },
    });
  }

  // Add some sample search history
  const sampleSearches = [
    "healthcare directories", 
    "business listing sites", 
    "tech directories", 
    "finance lists", 
    "marketing agencies"
  ];

  for (const keyword of sampleSearches) {
    await prisma.searchHistory.create({
      data: { keyword },
    });
  }

  console.log('✅ Seeding complete! Inserted/Verified 50 websites.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });