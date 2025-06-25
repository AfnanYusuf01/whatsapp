import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Show all users (main page)
export const index = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.render('crud/user-management', { 
      users,
      user: req.user,
      title: 'User Management'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get user data for modal (AJAX)
export const show = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        ownedAgency: {
          select: { id: true, name: true }
        },
        agency: {
          select: { id: true, name: true }
        },
        _count: {
          select: { contacts: true, contactTags: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Store new user (AJAX)
export const store = async (req, res) => {
  try {
    const { username, full_name, email, password, role, is_active } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        full_name,
        email,
        password: hashedPassword,
        role,
        is_active: is_active === 'true' || is_active === true,
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json({ 
      success: true, 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user',
      error: error.message 
    });
  }
};

// Update user (AJAX)
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, email, password, role, is_active } = req.body;

    const updateData = {
      username,
      full_name,
      email,
      role,
      is_active: is_active === 'true' || is_active === true,
      updated_at: new Date()
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: error.message 
    });
  }
};

// Delete user (AJAX)
export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

// Legacy methods for compatibility (redirect to index)
export const create = (req, res) => res.redirect('/dashboard/users');
export const edit = (req, res) => res.redirect('/dashboard/users'); 