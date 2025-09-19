    import jwt from 'jsonwebtoken';
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    export const verifyToken = async (req, res, next) => {
      try {
        const token = req.cookies.token;
        
        if (!token) {
          return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (!user) {
          return res.redirect('/login');
        }

        req.user = user;
        next();
      } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
      }
    };

    export const cekUser = async (req, res, next) => {
      try {
        const token = req.cookies.token;
    
        if (!token) {
          req.user = null;
          return next(); // lanjut meskipun tidak ada token
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
    
        if (!user) {
          req.user = null;
          return next(); // lanjut meskipun user tidak ditemukan
        }
    
        req.user = user;
        next(); // user valid, lanjut
      } catch (error) {
        req.user = null;
        res.clearCookie('token');
        return next(); // tetap lanjut meskipun error (misal token invalid)
      }
    };