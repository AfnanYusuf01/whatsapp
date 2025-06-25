import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Show all contact tags for current user (main page)
export const index = async (req, res) => {
  try {
    const tags = await prisma.contactTag.findMany({
      where: { user_id: req.user.id },
      include: {
        _count: {
          select: { contacts: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.render('crud/contact-tag-management', { 
      tags,
      user: req.user,
      title: 'Contact Tag Management'
    });
  } catch (error) {
    console.error('Error fetching contact tags:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get contact tag data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await prisma.contactTag.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      include: {
        contacts: {
          select: { id: true, name: true, phone: true, email: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Contact tag not found' });
    }

    res.json({ tag });
  } catch (error) {
    console.error('Error fetching contact tag:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new contact tag (AJAX)
export const store = async (req, res) => {
  try {
    const { name } = req.body;

    const tag = await prisma.contactTag.create({
      data: {
        name,
        user_id: req.user.id,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: { contacts: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact tag created successfully',
      tag 
    });
  } catch (error) {
    console.error('Error creating contact tag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating contact tag',
      error: error.message 
    });
  }
};

// Update contact tag (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await prisma.contactTag.updateMany({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      data: {
        name,
        updated_at: new Date()
      }
    });

    // Get updated tag with relations
    const updatedTag = await prisma.contactTag.findFirst({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      },
      include: {
        _count: {
          select: { contacts: true }
        },
        user: {
          select: { id: true, full_name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact tag updated successfully',
      tag: updatedTag 
    });
  } catch (error) {
    console.error('Error updating contact tag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating contact tag',
      error: error.message 
    });
  }
};

// Delete contact tag (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contactTag.deleteMany({
      where: { 
        id: parseInt(id),
        user_id: req.user.id 
      }
    });

    res.json({ 
      success: true, 
      message: 'Contact tag deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting contact tag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact tag',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/contact-tags');
export const edit = (req, res) => res.redirect('/dashboard/contact-tags'); 