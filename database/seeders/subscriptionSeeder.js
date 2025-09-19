import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedSubscriptions() {
  console.log('📦 Starting subscription seeding...');

  const now = new Date(); // waktu saat ini

  const subscriptions = [
    {
      owner_id: '7b71a29d-3bb8-45db-bfa4-b57dae93f086',
      name: 'Basic Plan',
      duration_days: 30,
      limit_device: 1,
      description: 'Paket langganan dasar selama 30 hari',
      price: 50000,
      created_at: now,
      updated_at: now,
    },
    {
      owner_id: '7b71a29d-3bb8-45db-bfa4-b57dae93f086',
      name: 'Premium Plan',
      duration_days: 90,
      limit_device: 5,
      description: 'Paket langganan premium selama 90 hari',
      price: 150000,
      created_at: now,
      updated_at: now,
    },
  ];

  for (const subscription of subscriptions) {
    const existing = await prisma.subscription.findFirst({
      where: { name: subscription.name },
    });

    if (!existing) {
      await prisma.subscription.create({
        data: subscription,
      });
      console.log(`✅ Subscription '${subscription.name}' created`);
    } else {
      console.log(`⚠️  Subscription '${subscription.name}' already exists`);
    }
  }
}

export default seedSubscriptions;
