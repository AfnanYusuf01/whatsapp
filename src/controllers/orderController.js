import { PrismaClient } from '@prisma/client';
import midtransClient from 'midtrans-client';

const prisma = new PrismaClient();
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-sKLnk6jQm-Wxyc7ztVGz7jge',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-ykTL-QKGeMgdZSlr'
});

// POST /order
export const createOrder = async (req, res) => {
  try {
    const { subscription_id } = req.body;
    const user = req.user;

    if (!user || !subscription_id) {
      return res.status(400).json({ error: 'User and subscription required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(subscription_id) }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order with payment data
    const order = await prisma.order.create({
      data: {
        user_id: user.id,
        subscription_id: subscription.id,
        amount: subscription.price,
        payment_status: 'PENDING',
        invoice_number: invoiceNumber,
        updated_at: new Date()
      },
      include: {
        subscription: true,
        user: true
      }
    });

    res.redirect(`/order/${order.id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /order/:id
// GET /order/:id
export const showOrderDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          subscription: true
        }
      });
  
      if (!order) {
        return res.status(404).render('error', { 
          message: 'Order not found',
          layout: false
        });
      }
  
      // Format tanggal untuk ditampilkan
      const formattedOrder = {
        ...order,
        paid_at: order.paid_at ? new Date(order.paid_at) : null
      };
  
      res.render('pending', {
        order: formattedOrder,
        user: order.user,
        subscription: order.subscription,
        title: 'Detail Pembayaran',
        layout: false,
        navigation: false,
        footer: false,
        midtransClientKey: process.env.MIDTRANS_CLIENT_KEY
      });
    } catch (error) {
      console.error('Error fetching order detail:', error);
      res.status(500).render('error', {
        message: 'Internal Server Error',
        layout: 'layouts/main'
      });
    }
  };

// POST /api/order/:id/pay
    export const initiatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            subscription: true
        }
        });

        if (!order) {
        return res.status(404).json({ 
            success: false,
            error: 'Order not found' 
        });
        }

        if (order.payment_status !== 'PENDING') {
        return res.status(400).json({
            success: false,
            error: 'Order payment has already been processed'
        });
        }

        // Dynamic parameters for Midtrans
        const parameter = {
        transaction_details: {
            order_id: order.id,
            gross_amount: Number(order.amount)
        },
        credit_card: {
            secure: true,
            save_card: false
        },
        item_details: [{
            id: `subs-${order.subscription.id}`,
            price: Number(order.amount),
            quantity: 1,
            name: order.subscription.name,
            category: 'Subscription',
            description: `Subscription for ${order.subscription.duration_days} days`
        }],
        customer_details: {
            first_name: order.user.full_name.split(' ')[0] || 'Customer',
            last_name: order.user.full_name.split(' ').slice(1).join(' ') || '',
            email: order.user.email,
            phone: order.user.no_wa || '',
            billing_address: {
            first_name: order.user.full_name.split(' ')[0] || 'Customer',
            last_name: order.user.full_name.split(' ').slice(1).join(' ') || '',
            email: order.user.email,
            phone: order.user.no_wa || '',
            address: 'Not specified',
            city: 'Not specified',
            postal_code: '00000',
            country_code: 'IDN'
            }
        },
        callbacks: {
            finish: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/finish`,
            error: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/error`,
            pending: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/pending`
        },
        expiry: {
            unit: 'hours',
            duration: 24
        },
        metadata: {
            user_id: order.user_id,
            subscription_id: order.subscription_id,
            invoice_number: order.invoice_number
        }
        };

        // Create Snap transaction
        const transaction = await snap.createTransaction(parameter);

        // Update order with payment data
        await prisma.order.update({
        where: { id },
        data: {
            payment_url: transaction.redirect_url,
            snap_token: transaction.token,
            external_id: transaction.transaction_id,
            expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            metadata: parameter.metadata
        }
        });

        res.json({
        success: true,
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: order.id
        });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ 
        success: false,
        error: 'Failed to initiate payment',
        details: error.message 
        });
    }
    };