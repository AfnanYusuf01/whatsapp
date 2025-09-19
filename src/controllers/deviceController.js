import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show device management page
export const index = async (req, res) => {
  try {
    // Get user's active subscription info
    const userSubscription = await getUserActiveSubscription(req.user.id);
    let subscriptionInfo = null;
    
    if (userSubscription) {
      // Fetch current device count from WhatsApp API
      let currentDeviceCount = 0;
      try {
        const API_TOKEN = process.env.WHATSAPP_API_TOKEN || "test123";
        const API_BASE_URL = process.env.WHATSAPP_API_URL || "http://localhost:5000/api/whatsapp";
        
        const response = await fetch(`${API_BASE_URL}/devices?userId=${req.user.id}`, {
          headers: {
            'X-API-Token': API_TOKEN
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.devices) {
            currentDeviceCount = result.data.devices.length;
          }
        }
      } catch (error) {
        console.error('Error fetching device count:', error);
        // Continue with 0 count if API is not available
      }
      
      subscriptionInfo = {
        subscriptionName: userSubscription.subscription.name,
        limitDevice: userSubscription.subscription.limit_device,
        currentDeviceCount: currentDeviceCount,
        remainingDevices: Math.max(0, userSubscription.subscription.limit_device - currentDeviceCount),
        canCreateDevice: currentDeviceCount < userSubscription.subscription.limit_device,
        status: userSubscription.status,
        endDate: userSubscription.end_date
      };
    }
    
    res.render('device', {
      title: 'Device Management',
      user: req.user,
      subscriptionInfo: subscriptionInfo,
      layout: 'layouts/dashboard', // relatif terhadap folder 'views'
      footer: true,
    });
    
  } catch (error) {
    console.error('Error loading device management page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get user's active subscription
async function getUserActiveSubscription(userId) {
  try {
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        start_date: {
          lte: new Date()
        },
        end_date: {
          gte: new Date()
        }
      },
      include: {
        subscription: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return activeSubscription;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

// API endpoint to check device limit before creation
export const checkDeviceLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const userSubscription = await getUserActiveSubscription(userId);
    
    if (!userSubscription) {
      return res.json({
        success: false,
        canCreate: false,
        message: 'No active subscription found. Please subscribe to create devices.',
        subscriptionInfo: null
      });
    }
    
    // Fetch current device count from WhatsApp API
    let currentDeviceCount = 0;
    try {
      const API_TOKEN = process.env.WHATSAPP_API_TOKEN || "test123";
      const API_BASE_URL = process.env.WHATSAPP_API_URL || "http://localhost:5000/api/whatsapp";
      
      const response = await fetch(`${API_BASE_URL}/devices?userId=${userId}`, {
        headers: {
          'X-API-Token': API_TOKEN
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.devices) {
          currentDeviceCount = result.data.devices.length;
        }
      }
    } catch (error) {
      console.error('Error fetching device count:', error);
      return res.json({
        success: false,
        canCreate: false,
        message: 'Unable to verify device count. API service may be unavailable.',
        subscriptionInfo: null
      });
    }
    
    const limitDevice = userSubscription.subscription.limit_device;
    const remainingDevices = Math.max(0, limitDevice - currentDeviceCount);
    const canCreate = currentDeviceCount < limitDevice;
    
    return res.json({
      success: true,
      canCreate: canCreate,
      message: canCreate ? 
        `You can create ${remainingDevices} more device(s)` : 
        'Device limit reached. Please upgrade your subscription.',
      subscriptionInfo: {
        subscriptionName: userSubscription.subscription.name,
        limitDevice: limitDevice,
        currentDeviceCount: currentDeviceCount,
        remainingDevices: remainingDevices,
        status: userSubscription.status,
        endDate: userSubscription.end_date
      }
    });
    
  } catch (error) {
    console.error('Error checking device limit:', error);
    res.status(500).json({
      success: false,
      canCreate: false,
      message: 'Internal server error',
      subscriptionInfo: null
    });
  }
};

// Show device settings page
export const showSettings = async (req, res) => {
  try {
    const deviceId = req.params.id;
    
    res.render('device-settings', {
      title: 'Device Settings',
      user: req.user,
      deviceId: deviceId
    });
  } catch (error) {
    console.error('Error loading device settings page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Show messages page
export const showMessages = async (req, res) => {
  try {
    res.render('messages', {
      title: 'Send Messages',
      user: req.user
    });
  } catch (error) {
    console.error('Error loading messages page:', error);
    res.status(500).send('Internal Server Error');
  }
}; 