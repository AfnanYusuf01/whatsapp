import express from 'express';
import jwt from 'jsonwebtoken';
import { listSessions, getUserDevices, deleteUserDevice, getAISettings, updateAISettings, createDevice, getBusinessTypes } from '../controllers/api/apiDeviceController.js';
import { sendMessage, getMessages } from '../controllers/api/apiMessageController.js';

const router = express.Router();

// API Authentication middleware
const apiAuth = (req, res, next) => {
  const apiToken = req.headers['x-api-token'];
  const jwtToken = req.cookies.token;
  
  // Check for either API token or JWT token
  if (!apiToken && !jwtToken) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide either X-API-Token header or JWT token in cookies'
    });
  }

  // If JWT token exists, verify it
  if (jwtToken) {
    try {
      // Verify JWT token (using the same secret as in authController)
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      // If JWT is invalid, fall back to API token check
    }
  }

  // If no valid JWT, check API token
  if (apiToken) {
    // You can validate the API token here against your database or config
    // For now, we'll accept any token (you can modify this later)
    req.apiToken = apiToken;
    return next();
  }

  // If neither authentication method is valid
  return res.status(401).json({
    success: false,
    message: 'Invalid authentication credentials'
  });
};

// Apply authentication to all routes
router.use(apiAuth);

// WhatsApp API routes
router.get('/whatsapp/alldevices', listSessions);
router.get('/whatsapp/devices', getUserDevices);
router.delete('/whatsapp/devices/:id', deleteUserDevice);
router.put('/whatsapp/devices/:id/settings/ai', updateAISettings);
router.post('/whatsapp/devices', createDevice);
router.get('/whatsapp/devices/:id/settings/ai', getAISettings);
router.get('/business-templates/types', getBusinessTypes);
router.post('/whatsapp/send', sendMessage);
router.get('/whatsapp/messages', getMessages);

export default router; 