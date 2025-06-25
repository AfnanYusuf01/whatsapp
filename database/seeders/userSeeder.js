import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  {
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: 'password123',
    full_name: 'Super Admin',
    no_wa: '+6281234567890',
    role: UserRole.SUPER_ADMIN,
  },
  {
    username: 'adminglobal',
    email: 'adminglobal@example.com',
    password: 'password123',
    full_name: 'Admin Global',
    no_wa: '+6281234567891',
    role: UserRole.ADMIN_GLOBAL,
  },
  {
    username: 'agency1',
    email: 'agency@example.com',
    password: 'password123',
    full_name: 'Agency Owner',
    no_wa: '+6281234567892',
    role: UserRole.AGENCY,
  },
  {
    username: 'adminagency',
    email: 'adminagency@example.com',
    password: 'password123',
    full_name: 'Admin Agency',
    no_wa: '+6281234567893',
    role: UserRole.ADMIN_AGENCY,
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    full_name: 'Regular User 1',
    no_wa: '+6281234567894',
    role: UserRole.USER,
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123',
    full_name: 'Regular User 2',
    no_wa: '+6281234567895',
    role: UserRole.USER,
  },
];

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Skipping seeding.');
      return;
    }

    // Create users
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          full_name: userData.full_name,
          no_wa: userData.no_wa,
          role: userData.role,
          updated_at: new Date(),
        },
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('🎉 User seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default seedUsers; 