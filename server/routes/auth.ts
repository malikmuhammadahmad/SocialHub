import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { authenticateToken } from '../middleware/auth';
import { JWT_SECRET } from '../config';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword);
    
    const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        username,
        email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User
router.get('/me', authenticateToken, (req: any, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, profilePicture, bio, location FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
