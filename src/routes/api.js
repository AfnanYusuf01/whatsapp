import express from 'express';
import { PrismaClient } from '@prisma/client';
import midtransClient from 'midtrans-client'
import jwt from 'jsonwebtoken';
import { initiatePayment } from '../controllers/orderController.js';
import { listSessions, getUserDevices, deleteUserDevice, getAISettings, updateAISettings, createDevice, getBusinessTypes } from '../controllers/api/apiDeviceController.js';
import { sendMessage, getMessages, sendImage, sendVideo, sendDocument, testConnection } from '../controllers/api/apiMessageController.js';
import { uploadFile, deleteFile, getFileStats, getFiles, previewFile } from '../controllers/api/apiFileController.js';
import { getWarmerDevices, getWarmerCampaigns, createWarmerCampaign, pauseWarmerCampaign, resumeWarmerCampaign, stopWarmerCampaign, getWarmerCampaignStats, createWarmerTemplate } from '../controllers/api/apiWarmerController.js';


const prisma = new PrismaClient();
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-sKLnk6jQm-Wxyc7ztVGz7jge',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-ykTL-QKGeMgdZSlr'
});
const router = express.Router();

// API Authentication middleware
const apiAuth = (req, res, next) => {

  if (req.path === '/midtrans-webhook') {
    return next();
  }


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
      console.log('=== JWT TOKEN DEBUG ===');
      console.log('Decoded JWT:', decoded);
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
router.get('/whatsapp/test', testConnection);
router.get('/whatsapp/alldevices', listSessions);
router.get('/whatsapp/devices', getUserDevices);
router.delete('/whatsapp/devices/:id', deleteUserDevice);
router.put('/whatsapp/devices/:id/settings/ai', updateAISettings);
router.post('/whatsapp/devices', createDevice);
router.get('/whatsapp/devices/:id/settings/ai', getAISettings);
router.get('/business-templates/types', getBusinessTypes);
router.post('/whatsapp/send', sendMessage);
router.post('/whatsapp/send/image', sendImage);
router.post('/whatsapp/send/video', sendVideo);
router.post('/whatsapp/send/document', sendDocument);
router.get('/whatsapp/messages', getMessages);

// File Management API routes
router.post('/whatsapp/files/upload', uploadFile);
router.delete('/whatsapp/files/:fileId', deleteFile);
router.get('/whatsapp/files/stats', getFileStats);
router.get('/whatsapp/files', getFiles);
router.get('/whatsapp/files/:fileId/preview', previewFile);

// Warmer Service API routes
router.get('/warmer/devices', getWarmerDevices);
router.get('/warmer/campaigns', getWarmerCampaigns);
router.post('/warmer/campaigns', createWarmerCampaign);
router.post('/warmer/campaigns/:id/pause', pauseWarmerCampaign);
router.post('/warmer/campaigns/:id/resume', resumeWarmerCampaign);
router.post('/warmer/campaigns/:id/stop', stopWarmerCampaign);
router.get('/warmer/campaigns/:id/stats', getWarmerCampaignStats);
router.post('/warmer/campaigns/:id/templates', createWarmerTemplate);



// API untuk memulai pembayaran
router.post('/order/:id/pay', initiatePayment);

// Webhook Midtrans
router.post('/midtrans-webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));
    
    const notification = req.body;
    const statusResponse = await snap.transaction.notification(notification);
    
    console.log('Status response:', statusResponse);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Processing order ${orderId} with status ${transactionStatus}`);

    // Logika status yang lebih robust
    let paymentStatus;
    switch (transactionStatus) {
      case 'capture':
        paymentStatus = fraudStatus === 'accept' ? 'PAID' : 'DENIED';
        break;
      case 'settlement':
        paymentStatus = 'PAID';
        break;
      case 'pending':
        paymentStatus = 'PENDING';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        paymentStatus = 'FAILED';
        break;
      default:
        paymentStatus = 'PENDING';
    }

    console.log(`Updating order to status: ${paymentStatus}`);

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        payment_status: paymentStatus,
        payment_method: statusResponse.payment_type,
        external_id: statusResponse.transaction_id,
        paid_at: paymentStatus === 'PAID' ? new Date() : null,
        metadata: statusResponse
      }
    });

    console.log('Order updated:', updatedOrder);

    // Jika pembayaran sukses, buat user subscription
    if (paymentStatus === 'PAID') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { subscription: true }
      });

      console.log('Creating subscription for order:', order);

      await prisma.userSubscription.create({
        data: {
          user_id: order.user_id,
          subscription_id: order.subscription_id,
          start_date: new Date(),
          end_date: new Date(Date.now() + order.subscription.duration_days * 24 * 60 * 60 * 1000),
          updated_at: new Date() // Tambahkan ini
        }
      });

      console.log('Subscription created successfully');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});


export default router; 