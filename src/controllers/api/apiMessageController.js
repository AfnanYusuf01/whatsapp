// controllers/apiMessageController.js
import axios from 'axios';

const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_URL || 'http://localhost:3000';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'test123';

// Test external API connection
export const testConnection = async (req, res) => {
  try {
    console.log('Testing connection to:', WHATSAPP_API_BASE_URL);
    
    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/health`, {
      headers: {
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      timeout: 10000
    });

    return res.status(200).json({
      success: true,
      message: 'Connection to WhatsApp API successful',
      data: {
        baseUrl: WHATSAPP_API_BASE_URL,
        status: response.status,
        response: response.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Connection test failed:', error);

    return res.status(503).json({
      success: false,
      message: 'Failed to connect to WhatsApp API',
      error: {
        baseUrl: WHATSAPP_API_BASE_URL,
        code: error.code,
        message: error.message,
        isConnectionRefused: error.code === 'ECONNREFUSED'
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const sendMessage = async (req, res) => {
  const { sessionId, recipient, message } = req.body;

  if (!sessionId || !recipient || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sessionId, recipient, and message are required.'
    });
  }

  try {
    const response = await axios.post(`${WHATSAPP_API_BASE_URL}/api/whatsapp/send`, {
      sessionId,
      recipient,
      message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      withCredentials: true,
      timeout: 30000
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending message:', error);

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

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  const { sessionId, limit = 50, offset = 0 } = req.query;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: sessionId is required.'
    });
  }

  try {
    const response = await axios.get(`${WHATSAPP_API_BASE_URL}/api/whatsapp/messages`, {
      params: {
        sessionId,
        limit,
        offset
      },
      headers: {
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      withCredentials: true,
      timeout: 30000
    });

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting messages:', error);

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

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send image message
export const sendImage = async (req, res) => {
  const { sessionId, recipient, fileId, caption } = req.body;

  console.log('=== SEND IMAGE DEBUG ===');
  console.log('Request body:', req.body);
  console.log('sessionId:', sessionId);
  console.log('recipient:', recipient);
  console.log('fileId:', fileId);
  console.log('caption:', caption);

  if (!sessionId || !recipient || !fileId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sessionId, recipient, and fileId are required.'
    });
  }

  try {
    const requestData = {
      sessionId,
      recipient,
      fileId,
      caption
    };

    console.log('Sending to external API:', `${WHATSAPP_API_BASE_URL}/api/whatsapp/send/image`);
    console.log('Request data:', requestData);

    const response = await axios.post(`${WHATSAPP_API_BASE_URL}/api/whatsapp/send/image`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': WHATSAPP_API_TOKEN,
        'Accept': 'application/json',
        'User-Agent': 'WhatsApp-Manager/1.0'
      },
      withCredentials: true,
      timeout: 60000 // Increased timeout for media files
    });

    console.log('External API response status:', response.status);
    console.log('External API response data:', response.data);

    return res.status(200).json({
      success: true,
      message: 'Image sent successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== SEND IMAGE ERROR DEBUG ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
      
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from WhatsApp API',
        error: error.response.data,
        details: {
          status: error.response.status,
          statusText: error.response.statusText
        }
      });
    }

    if (error.request) {
      console.error('Request config:', error.config);
      console.error('No response received from external API');
      
      // Check if it's a connection issue
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          message: 'WhatsApp API service unavailable',
          error: 'Cannot connect to WhatsApp API server. Please ensure the service is running.',
          details: {
            code: error.code,
            address: WHATSAPP_API_BASE_URL
          }
        });
      }

      if (error.code === 'ECONNRESET' || error.message.includes('Connection Closed')) {
        return res.status(503).json({
          success: false,
          message: 'Connection to WhatsApp API was reset',
          error: 'The connection was closed unexpectedly. This might be due to file size or timeout.',
          details: {
            code: error.code,
            timeout: '60 seconds'
          }
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Network error connecting to WhatsApp API',
        error: 'No response received from external API',
        details: {
          code: error.code
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      details: {
        type: error.name
      }
    });
  }
};

// Send video message
export const sendVideo = async (req, res) => {
  const { sessionId, recipient, fileId, caption } = req.body;

  if (!sessionId || !recipient || !fileId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sessionId, recipient, and fileId are required.'
    });
  }

  try {
    const response = await axios.post(`${WHATSAPP_API_BASE_URL}/api/whatsapp/send/video`, {
      sessionId,
      recipient,
      fileId,
      caption
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      withCredentials: true,
      timeout: 30000
    });

    return res.status(200).json({
      success: true,
      message: 'Video sent successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending video:', error);

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

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send document message
export const sendDocument = async (req, res) => {
  const { sessionId, recipient, fileId, fileName } = req.body;

  if (!sessionId || !recipient || !fileId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sessionId, recipient, and fileId are required.'
    });
  }

  try {
    const response = await axios.post(`${WHATSAPP_API_BASE_URL}/api/whatsapp/send/document`, {
      sessionId,
      recipient,
      fileId,
      fileName
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': WHATSAPP_API_TOKEN
      },
      withCredentials: true,
      timeout: 30000
    });

    return res.status(200).json({
      success: true,
      message: 'Document sent successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending document:', error);

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

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
