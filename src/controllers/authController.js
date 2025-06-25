    import { PrismaClient } from '@prisma/client';
    import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';

    const prisma = new PrismaClient();

    export const showLoginPage = (req, res) => {
    res.render('login', { error: null });
    };

    export const showDashboard = (req, res) => {
    const { role } = req.user;
    let template = 'dashboard';
    let title = '';

    switch (role) {
        case 'SUPER_ADMIN':
        title = 'Super Admin Dashboard';
        break;
        case 'ADMIN_GLOBAL':
        title = 'Admin Global Dashboard';
        break;
        case 'AGENCY':
        title = 'Agency Dashboard';
        break;
        case 'ADMIN_AGENCY':
        title = 'Admin Agency Dashboard';
        break;
        default:
        title = 'User Dashboard';
    }

    res.render(template, { 
        user: req.user,
        title: title
    });
    };

    export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findFirst({
        where: { email }
        });

        if (!user || !await bcrypt.compare(password, user.password)) {
        return res.render('login', { 
            error: 'Invalid email or password' 
        });
        }

        const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
        );

        res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
        error: 'An error occurred during login' 
        });
    }
    };

    export const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
    }; 