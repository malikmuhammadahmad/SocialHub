import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get Notifications
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    const notifications = db.prepare(`
      SELECT n.*, u.username as senderName, u.profilePicture as senderPhoto
      FROM notifications n
      JOIN users u ON n.senderId = u.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT 50
    `).all(userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark as Read
router.put('/read-all', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  try {
    db.prepare('UPDATE notifications SET readStatus = 1 WHERE userId = ?').run(userId);
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

export default router;
