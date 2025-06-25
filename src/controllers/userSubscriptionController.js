import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show all user subscriptions (main page)
export const index = async (req, res) => {
  try {
    const userSubscriptions = await prisma.userSubscription.findMany({
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        subscription: {
          select: { id: true, name: true, price: true, duration_days: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const users = await prisma.user.findMany({
      select: { id: true, full_name: true, email: true }
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { is_active: true },
      select: { id: true, name: true, price: true, duration_days: true }
    });

    res.render('crud/user-subscription-management', { 
      userSubscriptions,
      users,
      subscriptions,
      user: req.user,
      title: 'User Subscription Management'
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get user subscription data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userSubscription = await prisma.userSubscription.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        subscription: {
          select: { 
            id: true, 
            name: true, 
            description: true, 
            price: true, 
            duration_days: true,
            limit_device: true
          }
        }
      }
    });

    if (!userSubscription) {
      return res.status(404).json({ error: 'User subscription not found' });
    }

    res.json({ userSubscription });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new user subscription (AJAX)
export const store = async (req, res) => {
  try {
    const { user_id, subscription_id, start_date, end_date, status } = req.body;

    const userSubscription = await prisma.userSubscription.create({
      data: {
        user_id,
        subscription_id: parseInt(subscription_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: status || 'ACTIVE',
        updated_at: new Date()
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        subscription: {
          select: { id: true, name: true, price: true, duration_days: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'User subscription created successfully',
      userSubscription 
    });
  } catch (error) {
    console.error('Error creating user subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user subscription',
      error: error.message 
    });
  }
};

// Update user subscription (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, subscription_id, start_date, end_date, status } = req.body;

    const userSubscription = await prisma.userSubscription.update({
      where: { id: parseInt(id) },
      data: {
        user_id,
        subscription_id: parseInt(subscription_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: status || 'ACTIVE',
        updated_at: new Date()
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        subscription: {
          select: { id: true, name: true, price: true, duration_days: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'User subscription updated successfully',
      userSubscription 
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user subscription',
      error: error.message 
    });
  }
};

// Delete user subscription (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.userSubscription.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true, 
      message: 'User subscription deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user subscription',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/user-subscriptions');
export const edit = (req, res) => res.redirect('/dashboard/user-subscriptions'); 