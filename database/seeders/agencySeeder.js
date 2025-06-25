import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAgencies() {
  try {
    console.log('🏢 Starting agency seeding...');

    // Check if agencies already exist
    const existingAgencies = await prisma.agency.count();
    if (existingAgencies > 0) {
      console.log('⚠️  Agencies already exist. Skipping seeding.');
      return;
    }

    // Get agency owners (users with AGENCY role)
    const agencyOwners = await prisma.user.findMany({
      where: { role: 'AGENCY' }
    });

    if (agencyOwners.length === 0) {
      console.log('⚠️  No agency owners found. Make sure to run user seeder first.');
      return;
    }

    const agencies = [
      {
        id: crypto.randomUUID(),
        owner_id: agencyOwners[0].id,
        name: 'Tech Solutions Agency',
        slug: 'tech-solutions',
        domain: 'techsolutions.com',
        company_name: 'Tech Solutions Ltd.',
        tagline: 'Your trusted technology partner',
        logo_url: 'https://via.placeholder.com/150x150?text=TECH',
        favicon_url: 'https://via.placeholder.com/32x32?text=T',
      },
      {
        id: crypto.randomUUID(),
        owner_id: agencyOwners[0].id,
        name: 'Digital Marketing Pro',
        slug: 'digital-marketing-pro',
        domain: 'digitalmarketingpro.com',
        company_name: 'Digital Marketing Pro Inc.',
        tagline: 'Grow your business digitally',
        logo_url: 'https://via.placeholder.com/150x150?text=DMP',
        favicon_url: 'https://via.placeholder.com/32x32?text=D',
      }
    ];

    // Create agencies
    for (const agencyData of agencies) {
      const agency = await prisma.agency.create({
        data: {
          ...agencyData,
          updated_at: new Date(),
        },
      });

      console.log(`✅ Created agency: ${agency.name}`);
    }

    console.log('🎉 Agency seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding agencies:', error);
    throw error;
  }
}

export default seedAgencies; 