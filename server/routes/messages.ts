import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Send Message
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user?.id;

  try {
    const result = db.prepare('INSERT INTO messages (senderId, receiverId, text) VALUES (?, ?, ?)').run(senderId, receiverId, text);
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get Messages with User
router.get('/:userId', authenticateToken, (req: AuthRequest, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user?.id;

  try {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
      ORDER BY createdAt ASC
    `).all(currentUserId, otherUserId, otherUserId, currentUserId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get Conversations
router.get('/conversations/all', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    const conversations = db.prepare(`
      SELECT DISTINCT u.id, u.username, u.profilePicture,
      (SELECT text FROM messages WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id) ORDER BY createdAt DESC LIMIT 1) as lastMessage,
      (SELECT createdAt FROM messages WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id) ORDER BY createdAt DESC LIMIT 1) as lastMessageAt
      FROM users u
      JOIN messages m ON (m.senderId = u.id OR m.receiverId = u.id)
      WHERE (m.senderId = ? OR m.receiverId = ?) AND u.id != ?
      ORDER BY lastMessageAt DESC
    `).all(userId, userId, userId, userId, userId, userId, userId);
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

export default router;
