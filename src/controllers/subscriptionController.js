import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show all subscriptions (main page)
export const index = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        _count: {
          select: { userSubscriptions: true }
        },
        owner: {
          select: { id: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const agencies = await prisma.agency.findMany({
      select: { id: true, name: true }
    });
    console.log(agencies);
    res.render('crud/subscription-management', { 
      subscriptions,  
      agencies,
      user: req.user,
      title: 'Subscription Management'
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get subscription data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
      include: {
        userSubscriptions: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true }
            }
          }
        },
        owner: {
          select: { id: true, name: true }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new subscription (AJAX)
export const store = async (req, res) => {
  try {
    const { owner_id, name, description, price, duration_days, limit_device, is_active } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        owner_id,
        name,
        description: description || null,
        price: parseFloat(price),
        duration_days: parseInt(duration_days),
        limit_device: parseInt(limit_device) || 1,
        is_active: is_active === 'true' || is_active === true,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: { userSubscriptions: true }
        },
        owner: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Subscription created successfully',
      subscription 
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating subscription',
      error: error.message 
    });
  }
};

// Update subscription (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_id, name, description, price, duration_days, limit_device, is_active } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        owner_id,
        name,
        description: description || null,
        price: parseFloat(price),
        duration_days: parseInt(duration_days),
        limit_device: parseInt(limit_device) || 1,
        is_active: is_active === 'true' || is_active === true,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: { userSubscriptions: true }
        },
        owner: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Subscription updated successfully',
      subscription 
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating subscription',
      error: error.message 
    });
  }
};

// Delete subscription (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subscription.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true, 
      message: 'Subscription deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting subscription',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/subscriptions');
export const edit = (req, res) => res.redirect('/dashboard/subscriptions'); 