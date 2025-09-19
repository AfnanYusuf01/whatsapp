    import { PrismaClient } from '@prisma/client';
    import bcrypt from 'bcryptjs';
    import jwt from 'jsonwebtoken';

    const prisma = new PrismaClient();

    export const showLoginPage = (req, res) => {
    res.render('login', { 
        error: null,
        layout: false 
    });
    };

    export const showRegisterPage = (req, res) => {
        res.render('register', { 
            error: null,
            layout: false 
        });
    };

    export const showDashboard = async (req, res) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { is_active: true },
        include: {
            _count: {
            select: { userSubscriptions: true }
            },
            owner: {
            select: { id: true, name: true }
            }
        },
        orderBy: { price: 'asc' }
        });
    
    const { role } = req.user;
    let template = 'index';
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
        title: title,
        subscriptions
    });
    };

    export const register = async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.body;

            // Basic validation
            if (!name || !email || !password || !confirmPassword) {
                return res.render('register', { 
                    error: 'All fields are required',
                    layout: false
                });
            }

            if (password !== confirmPassword) {
                return res.render('register', { 
                    error: 'Passwords do not match',
                    layout: false
                });
            }

            if (password.length < 6) {
                return res.render('register', { 
                    error: 'Password must be at least 6 characters long',
                    layout: false
                });
            }

            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: { email }
            });

            if (existingUser) {
                return res.render('register', { 
                    error: 'Email already registered',
                    layout: false
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER'
                }
            });

            console.log('[REGISTER] User created successfully:', user.email);

            // Generate token and login user
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

            res.redirect('/');
        } catch (error) {
            console.error('[REGISTER ERROR]', error);
            res.render('register', { 
                error: 'An error occurred during registration',
                layout: false
            });
        }
    };

    export const login = async (req, res) => {
        try {
            const { email, password } = req.body;
    
            console.log('[LOGIN] Attempt with email:', email);
    
            const user = await prisma.user.findFirst({
                where: { email }
            });
    
            if (!user) {
                console.log('[LOGIN] Email not found');
                return res.render('login', { 
                    error: 'Invalid email or password',
                    layout: false
                });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.log('[LOGIN] Password mismatch for user:', email);
                return res.render('login', { 
                    error: 'Invalid email or password',
                    layout: false
                });
            }
    
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            console.log('[LOGIN] Login successful. User ID:', user.id);
    
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
    
            res.redirect('/');
        } catch (error) {
            console.error('[LOGIN ERROR]', error);
            res.render('login', { 
                error: 'An error occurred during login',
                layout: false
            });
        }
    };
    

    export const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
}; 