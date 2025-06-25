// controllers/apiMessageController.js
import axios from 'axios';

const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_URL || 'http://localhost:3000';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'test123';

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
