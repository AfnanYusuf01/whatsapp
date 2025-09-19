import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function isAdmin(user) {
  return user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_GLOBAL');
}

export const listPayments = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).send('Forbidden');
  const orders = await prisma.order.findMany({
    include: { user: true, subscription: true },
    orderBy: { created_at: 'desc' }
  });
  res.render('payments', { title: 'Payment Management', user: req.user, orders });
};

export const createPayment = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).send('Forbidden');
  const { user_id, subscription_id, amount, payment_method, payment_status } = req.body;
  await prisma.order.create({
    data: { user_id, subscription_id: Number(subscription_id), amount: Number(amount), payment_method, payment_status },
  });
  res.redirect('/dashboard/payments');
};

export const updatePayment = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).send('Forbidden');
  const { id } = req.params;
  const { amount, payment_method, payment_status } = req.body;
  await prisma.order.update({
    where: { id },
    data: { amount: Number(amount), payment_method, payment_status },
  });
  res.redirect('/dashboard/payments');
};

export const deletePayment = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).send('Forbidden');
  const { id } = req.params;
  await prisma.order.delete({ where: { id } });
  res.redirect('/dashboard/payments');
}; 