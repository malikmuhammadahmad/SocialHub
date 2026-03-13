import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Add Comment
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const { postId, text } = req.body;
  const userId = req.user?.id;
  const pId = Number(postId);

  try {
    const result = db.prepare('INSERT INTO comments (postId, userId, text) VALUES (?, ?, ?)').run(pId, userId, text);
    
    const comment = db.prepare(`
      SELECT c.*, u.username, u.profilePicture 
      FROM comments c 
      JOIN users u ON c.userId = u.id 
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    // Notification
    const post = db.prepare('SELECT userId FROM posts WHERE id = ?').get(pId) as any;
    if (post && post.userId !== userId) {
      db.prepare('INSERT INTO notifications (userId, type, referenceId, senderId) VALUES (?, ?, ?, ?)')
        .run(post.userId, 'comment', pId, userId);
      
      const io = req.app.get('io');
      io.to(`user_${post.userId}`).emit('notification', { type: 'comment', senderId: userId, referenceId: pId });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Get Comments for Post
router.get('/:postId', authenticateToken, (req, res) => {
  const postId = Number(req.params.postId);
  try {
    const comments = db.prepare(`
      SELECT c.*, u.username, u.profilePicture 
      FROM comments c 
      JOIN users u ON c.userId = u.id 
      WHERE c.postId = ?
      ORDER BY c.createdAt ASC
    `).all(postId);
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

export default router;
