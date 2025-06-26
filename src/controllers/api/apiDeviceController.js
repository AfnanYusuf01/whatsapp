import axios from 'axios';

// Configuration for external WhatsApp API
const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_URL || 'http://localhost:3000'; // Change this to your actual WhatsApp API URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'test123';

// List WhatsApp sessions
export const listSessions = async (req, res) => {
  try {
    // Make request to external WhatsApp API
    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/sessions`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7',
          'Connection': 'keep-alive',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'DNT': '1'
        },
        withCredentials: true, // Jika butuh cookie
        timeout: 30000
      });
      // Return the response from external API
    res.json({
      success: true,
      message: 'Sessions retrieved successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching WhatsApp sessions:', error);

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp API service unavailable',
        error: 'Connection refused'
      });
    }

    if (error.response) {
      // External API returned an error
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data
      });
    }

    if (error.request) {
      // Network error
      return res.status(503).json({
        success: false,
        message: 'Network error connecting to WhatsApp API',
        error: 'No response received'
      });
    }

    // Other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user devices
export const getUserDevices = async (req, res) => {
    try {
      // Ambil user ID dari token
      const userId = req.user?.userId;

  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: user not found in token'
        });
      }
  
      // Panggil WhatsApp API pakai userId
      const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/users/${userId}/devices`, {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN
        },
        withCredentials: true,
        timeout: 30000
      });
  
      res.json({
        success: true,
        message: 'User devices retrieved successfully',
        data: response.data,
        userId: userId,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      // error handling seperti sebelumnya
      console.error(error);
    }
  };


  export const deleteUserDevice = async (req, res) => {
    try {
      const deviceId = req.params.id;
  
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required in the URL'
        });
      }
  
      // Lakukan request DELETE ke API WhatsApp dengan deviceId
      const response = await axios.delete(`${WHATSAPP_API_BASE_URL}/api/whatsapp/devices/${deviceId}`, {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN
        },
        withCredentials: true,
        timeout: 30000
      });
  
      res.json({
        success: true,
        message: 'Device deleted successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error deleting device:', error);
  
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
          message: 'Network error',
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
  

  export const updateAISettings = async (req, res) => {
    const deviceId = req.params.id;
  
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required in URL path' });
    }
  
    try {
      const response = await axios.put(
        `${WHATSAPP_API_BASE_URL}/api/whatsapp/devices/${deviceId}/settings/ai`,
        req.body, // kirim body dari request user
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': WHATSAPP_API_TOKEN
          },
          withCredentials: true,
          timeout: 30000
        }
      );
  
      res.json({
        success: true,
        message: 'AI settings updated successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error updating AI settings:', error);
  
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
          message: 'Network error',
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

  // POST /whatsapp/devices
export const createDevice = async (req, res) => {
    try {
      const { userId, alias } = req.body;
  
      if (!userId || !alias) {
        return res.status(400).json({
          success: false,
          message: 'userId and alias are required in the request body'
        });
      }
  
      const response = await axios.post(
        `${WHATSAPP_API_BASE_URL}/api/whatsapp/devices`,
        { userId, alias }, // body
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': WHATSAPP_API_TOKEN
          },
          withCredentials: true,
          timeout: 30000
        }
      );
  
      res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error creating device:', error);
  
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
          message: 'Network error',
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
  
  export const getAISettings = async (req, res) => {
    const deviceId = req.params.id;
  
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required in URL path' });
    }
  
    try {
      const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/devices/${deviceId}/settings/ai`, {
        headers: {
          'X-API-Token': WHATSAPP_API_TOKEN
        }
      });
  
      res.json({
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI settings',
        error: error.message
      });
    }
  };
  

  export const getBusinessTypes = async (req, res) => {
    try {
      const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/business-templates/types`, {
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en;q=0.9,ar;q=0.8,id;q=0.7',
          'Connection': 'keep-alive',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'X-API-Token': WHATSAPP_API_TOKEN,
          'DNT': '1'
        },
        withCredentials: true,
        timeout: 30000
      });
  
      res.json({
        success: true,
        message: 'Business template types retrieved successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error fetching business types:', error);
  
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
          message: 'Network error',
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
  