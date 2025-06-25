import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show all contacts for current user (main page)
export const index = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { user_id: req.user.id },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const tags = await prisma.contactTag.findMany({
      where: { user_id: req.user.id },
      select: { id: true, name: true }
    });

    res.render('crud/contact-management', { 
      contacts,
      tags,
      user: req.user,
      title: 'Contact Management'
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get contact data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await prisma.contact.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new contact (AJAX)
export const store = async (req, res) => {
  try {
    const { name, phone, email, notes, tag_id } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email: email || null,
        notes: notes || null,
        user_id: req.user.id,
        tag_id: tag_id ? parseInt(tag_id) : null,
        updated_at: new Date()
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact created successfully',
      contact 
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating contact',
      error: error.message 
    });
  }
};

// Update contact (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, tag_id } = req.body;

    const contact = await prisma.contact.updateMany({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      data: {
        name,
        phone,
        email: email || null,
        notes: notes || null,
        tag_id: tag_id ? parseInt(tag_id) : null,
        updated_at: new Date()
      }
    });

    // Get updated contact with relations
    const updatedContact = await prisma.contact.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      include: {
        tag: {
          select: { id: true, name: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact updated successfully',
      contact: updatedContact 
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating contact',
      error: error.message 
    });
  }
};

// Delete contact (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.deleteMany({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/contacts');
export const edit = (req, res) => res.redirect('/dashboard/contacts'); 