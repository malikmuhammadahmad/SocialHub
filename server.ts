import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes
import authRoutes from './server/routes/auth';
import userRoutes from './server/routes/users';
import postRoutes from './server/routes/posts';
import commentRoutes from './server/routes/comments';
import messageRoutes from './server/routes/messages';
import notificationRoutes from './server/routes/notifications';

dotenv.config();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use('/api/', limiter);

  // Socket.io setup
  app.set('io', io);
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Serve static files from uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
