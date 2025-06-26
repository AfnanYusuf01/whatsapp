import axios from 'axios';

// Configuration for external WhatsApp API
const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_URL || 'http://localhost:3000';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'test123';

// Get devices for warmer (proxy to existing getUserDevices logic)
export const getWarmerDevices = async (req, res) => {
  try {
    // Ambil user ID dari token yang sudah login
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    // Panggil WhatsApp API untuk mendapatkan user devices
    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/users/${userId}/devices`, {
      headers: {
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      withCredentials: true,
      timeout: 30000
    });

    console.log('=== WARMER CONTROLLER DEBUG ===');
    console.log('External API response:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data is array:', Array.isArray(response.data));

    // Handle different response structures from external API
    let devices = [];
    if (Array.isArray(response.data)) {
      devices = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      devices = response.data.data;
    } else if (response.data && Array.isArray(response.data.devices)) {
      devices = response.data.devices;
    } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
      devices = response.data.data;
    } else {
      console.warn('Unexpected external API response structure:', response.data);
      devices = [];
    }

    console.log('Processed devices array:', devices);
    console.log('Devices count:', devices.length);

    res.json({
      success: true,
      message: 'Warmer devices retrieved successfully',
      data: devices,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching warmer devices:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp API service unavailable',
        error: 'Connection refused'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to WhatsApp API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get warmer campaigns
export const getWarmerCampaigns = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/warmer/campaigns?userId=${userId}`, {
      headers: {
        'X-API-Token': WHATSAPP_API_TOKEN,
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
        'Connection': 'keep-alive',
        'DNT': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      },
      withCredentials: true,
      timeout: 30000
    });

    console.log('=== CAMPAIGN RESPONSE DEBUG (BACKEND) ===');
    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log('Response data is array:', Array.isArray(response.data));
    console.log('Response data:', response.data);
    console.log('Response data length:', response.data ? response.data.length : 'undefined');

    // Handle different possible response structures
    let campaigns = response.data;
    
    // If response.data has a "data" property (nested structure)
    if (response.data && response.data.data) {
      console.log('Found nested data structure');
      campaigns = response.data.data;
    }
    
    // If response.data has a "campaigns" property
    if (response.data && response.data.campaigns) {
      console.log('Found campaigns property');
      campaigns = response.data.campaigns;
    }

    console.log('Final campaigns to send:', campaigns);
    console.log('Final campaigns type:', typeof campaigns);
    console.log('Final campaigns is array:', Array.isArray(campaigns));

    res.json({
      success: true,
      message: 'Warmer campaigns retrieved successfully',
      data: campaigns,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching warmer campaigns:', error);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Warmer API service unavailable',
        error: 'Connection refused'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create warmer campaign
export const createWarmerCampaign = async (req, res) => {
  try {
    const userId = req.user?.userId;

    console.log('=== CREATE CAMPAIGN DEBUG ===');
    console.log('req.user:', req.user);
    console.log('userId:', userId);
    console.log('req.body:', req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    // Kirim userId sebagai query parameter, bukan di body
    const campaignData = req.body; // Body tanpa userId

    console.log('campaignData to be sent:', campaignData);
    console.log('URL will be:', `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns?userId=${userId}`);

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns?userId=${userId}`,
      campaignData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.status(201).json({
      success: true,
      message: 'Warmer campaign created successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating warmer campaign:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Pause warmer campaign
export const pauseWarmerCampaign = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const campaignId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required in URL path'
      });
    }

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns/${campaignId}/pause?userId=${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.json({
      success: true,
      message: 'Warmer campaign paused successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error pausing warmer campaign:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Resume warmer campaign
export const resumeWarmerCampaign = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const campaignId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required in URL path'
      });
    }

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns/${campaignId}/resume?userId=${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.json({
      success: true,
      message: 'Warmer campaign resumed successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error resuming warmer campaign:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Stop warmer campaign
export const stopWarmerCampaign = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const campaignId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required in URL path'
      });
    }

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns/${campaignId}/stop?userId=${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.json({
      success: true,
      message: 'Warmer campaign stopped successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error stopping warmer campaign:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get warmer campaign statistics
export const getWarmerCampaignStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const campaignId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required in URL path'
      });
    }

    const response = await axios.get(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns/${campaignId}/stats?userId=${userId}`,
      {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.json({
      success: true,
      message: 'Warmer campaign stats retrieved successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching warmer campaign stats:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create warmer campaign template
export const createWarmerTemplate = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const campaignId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found in token'
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required in URL path'
      });
    }

    // Kirim userId sebagai query parameter, bukan di body
    const templateData = req.body; // Body tanpa userId

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/api/warmer/campaigns/${campaignId}/templates?userId=${userId}`,
      templateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7,en-US;q=0.6,ms;q=0.5',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': WHATSAPP_API_BASE_URL,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        },
        withCredentials: true,
        timeout: 30000
      }
    );

    res.status(201).json({
      success: true,
      message: 'Warmer template created successfully',
      data: response.data,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating warmer template:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Warmer API',
        error: error.response.data
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to Warmer API',
        error: 'No response received'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 