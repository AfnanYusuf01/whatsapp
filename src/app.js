  import express from 'express';
  import cors from 'cors';
  import cookieParser from 'cookie-parser';
  import fileUpload from 'express-fileupload';
  import dotenv from 'dotenv';
  import path from 'path';
  import expressLayouts from 'express-ejs-layouts';
  import { fileURLToPath } from 'url';
  import ngrok from 'ngrok';

  import generalRoutes from './routes/web.js';
  import apiRoutes from './routes/api.js';

  // Setup dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Load environment variables
  dotenv.config();

  const app = express();

  // Static files
  app.use(express.static(path.join(__dirname, 'static')));
  app.use('/public', express.static(path.join(__dirname, 'public')));

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true
  }));

  // View engine setup
  app.use(expressLayouts);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views')); // ✅ Pastikan foldernya sesuai
  app.set('layout', 'layouts/dashboard'); // ✅ path relatif dari /views

  // Routes
  app.use('/', generalRoutes);     // web routes (frontend)
  app.use('/api', apiRoutes);      // API routes (backend)

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);

    try {
      const url = await ngrok.connect({
        addr: PORT,
        // authtoken: '  2jbdy8zzLMBYx0LQZSLuVseNuZl_3HAFhc8DLp866eqGCcQtz', // optional jika belum login
        proto: 'http',
      });
      console.log(`🌐 Ngrok public URL: ${url}`);
    } catch (err) {
      console.error('💥 Failed to connect Ngrok:', err.message);
    }
  });