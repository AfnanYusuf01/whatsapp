import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Show all agencies (main page)
export const index = async (req, res) => {
  try {
    const agencies = await prisma.agency.findMany({
      include: {
        owner: {
          select: { id: true, full_name: true, email: true }
        },
        users: {
          select: { id: true, full_name: true, email: true }
        },
        _count: {
          select: { users: true, subscriptions: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const users = await prisma.user.findMany({
      where: { role: { in: ['AGENCY', 'SUPER_ADMIN'] } },
      select: { id: true, full_name: true, email: true }
    });

    res.render('crud/agency-management', { 
      agencies,
      users,
      user: req.user,
      title: 'Agency Management'
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get agency data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true }
        },
        users: {
          select: { id: true, full_name: true, email: true, role: true }
        },
        subscriptions: {
          select: { id: true, name: true, price: true, is_active: true }
        }
      }
    });

    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    res.json({ agency });
  } catch (error) {
    console.error('Error fetching agency:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new agency (AJAX)
export const store = async (req, res) => {
  try {
    const { owner_id, name, slug, domain, company_name, tagline, logo_url, favicon_url } = req.body;

    const agency = await prisma.agency.create({
      data: {
        id: crypto.randomUUID(),
        owner_id,
        name,
        slug,
        domain: domain || null,
        company_name: company_name || null,
        tagline: tagline || null,
        logo_url: logo_url || null,
        favicon_url: favicon_url || null,
        updated_at: new Date()
      },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true }
        },
        _count: {
          select: { users: true, subscriptions: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Agency created successfully',
      agency 
    });
  } catch (error) {
    console.error('Error creating agency:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating agency',
      error: error.message 
    });
  }
};

// Update agency (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_id, name, slug, domain, company_name, tagline, logo_url, favicon_url, is_active } = req.body;

    const agency = await prisma.agency.update({
      where: { id },
      data: {
        owner_id,
        name,
        slug,
        domain: domain || null,
        company_name: company_name || null,
        tagline: tagline || null,
        logo_url: logo_url || null,
        favicon_url: favicon_url || null,
        is_active: is_active === 'true' || is_active === true,
        updated_at: new Date()
      },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true }
        },
        _count: {
          select: { users: true, subscriptions: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Agency updated successfully',
      agency 
    });
  } catch (error) {
    console.error('Error updating agency:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating agency',
      error: error.message 
    });
  }
};

// Delete agency (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.agency.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Agency deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting agency:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting agency',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/agencies');
export const edit = (req, res) => res.redirect('/dashboard/agencies'); 