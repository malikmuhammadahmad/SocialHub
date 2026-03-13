import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import upload from '../utils/upload';

const router = express.Router();

// Create Post
router.post('/create', authenticateToken, upload.single('image'), (req: AuthRequest, res) => {
  const { caption } = req.body;
  const userId = req.user?.id;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = db.prepare('INSERT INTO posts (userId, caption, image) VALUES (?, ?, ?)').run(userId, caption, image);
    
    // Get the created post with user info
    const post = db.prepare(`
      SELECT p.*, u.username, u.profilePicture 
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Get Feed
router.get('/feed', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;

  try {
    // Get posts from followed users + own posts
    const posts = db.prepare(`
      SELECT p.*, u.username, u.profilePicture,
      (SELECT COUNT(*) FROM likes WHERE postId = p.id) as likesCount,
      (SELECT COUNT(*) FROM likes WHERE postId = p.id AND userId = ?) as isLiked
      FROM posts p
      JOIN users u ON p.userId = u.id
      WHERE p.userId = ? OR p.userId IN (SELECT followingId FROM follows WHERE followerId = ?)
      ORDER BY p.createdAt DESC
    `).all(userId, userId, userId);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

// Like Post
router.post('/:id/like', authenticateToken, (req: AuthRequest, res) => {
  const postId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const existingLike = db.prepare('SELECT * FROM likes WHERE postId = ? AND userId = ?').get(postId, userId);
    
    if (existingLike) {
      db.prepare('DELETE FROM likes WHERE postId = ? AND userId = ?').run(postId, userId);
      return res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO likes (postId, userId) VALUES (?, ?)').run(postId, userId);
      
      // Create notification
      const post = db.prepare('SELECT userId FROM posts WHERE id = ?').get(postId) as any;
      if (post && post.userId !== userId) {
        db.prepare('INSERT INTO notifications (userId, type, referenceId, senderId) VALUES (?, ?, ?, ?)')
          .run(post.userId, 'like', postId, userId);
        
        // Emit socket event
        const io = req.app.get('io');
        io.to(`user_${post.userId}`).emit('notification', { type: 'like', senderId: userId, referenceId: postId });
      }

      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Delete Post
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  const postId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const post = db.prepare('SELECT userId FROM posts WHERE id = ?').get(postId) as any;
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    // Delete related records first due to foreign key constraints
    db.prepare('DELETE FROM likes WHERE postId = ?').run(postId);
    db.prepare('DELETE FROM comments WHERE postId = ?').run(postId);
    db.prepare("DELETE FROM notifications WHERE referenceId = ? AND (type = 'like' OR type = 'comment')").run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

export default router;
