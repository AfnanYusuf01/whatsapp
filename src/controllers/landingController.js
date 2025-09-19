import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const showLandingPage = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: { userSubscriptions: true }
        },
        owner: {
          select: { id: true, name: true }
        }
      },
      orderBy: { price: 'asc' }
    });



    res.render('landing', { 
      title: 'WhatsApp Business Management',
      layout: 'layouts/main',
      navigation: false,
      footer: false,
      user: req.user,
      subscriptions  // 👈 tambahan data subscription ke landing page
    });
  } catch (error) {
    console.error('Error loading landing page with subscriptions:', error);
    res.status(500).render('landing', {
      title: 'WhatsApp Business Management',
      layout: 'layouts/main',
      navigation: true,
      footer: true,
      user: req.user,
      subscriptions: [],
      error: 'Unable to load subscription plans'
    });
  }
};
