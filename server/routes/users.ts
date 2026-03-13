import express from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import upload from '../utils/upload';

const router = express.Router();

// Get User Profile
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const profileId = req.params.id;
  const currentUserId = req.user?.id;

  try {
    const user = db.prepare(`
      SELECT id, username, email, profilePicture, bio, location, createdAt,
      (SELECT COUNT(*) FROM follows WHERE followingId = ?) as followersCount,
      (SELECT COUNT(*) FROM follows WHERE followerId = ?) as followingCount,
      (SELECT COUNT(*) FROM follows WHERE followingId = ? AND followerId = ?) as isFollowing
      FROM users WHERE id = ?
    `).get(profileId, profileId, profileId, currentUserId, profileId) as any;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = db.prepare('SELECT * FROM posts WHERE userId = ? ORDER BY createdAt DESC').all(profileId);

    res.json({ user, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update Profile
router.put('/update', authenticateToken, upload.single('profilePicture'), (req: AuthRequest, res) => {
  const { bio, location } = req.body;
  const userId = req.user?.id;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    if (profilePicture) {
      db.prepare('UPDATE users SET bio = ?, location = ?, profilePicture = ? WHERE id = ?').run(bio, location, profilePicture, userId);
    } else {
      db.prepare('UPDATE users SET bio = ?, location = ? WHERE id = ?').run(bio, location, userId);
    }

    const updatedUser = db.prepare('SELECT id, username, email, profilePicture, bio, location FROM users WHERE id = ?').get(userId);
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Follow/Unfollow
router.post('/follow', authenticateToken, (req: AuthRequest, res) => {
  const { followingId } = req.body;
  const followerId = req.user?.id;

  if (followerId === followingId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const existingFollow = db.prepare('SELECT * FROM follows WHERE followerId = ? AND followingId = ?').get(followerId, followingId);

    if (existingFollow) {
      db.prepare('DELETE FROM follows WHERE followerId = ? AND followingId = ?').run(followerId, followingId);
      res.json({ following: false });
    } else {
      db.prepare('INSERT INTO follows (followerId, followingId) VALUES (?, ?)').run(followerId, followingId);
      
      // Notification
      db.prepare('INSERT INTO notifications (userId, type, senderId) VALUES (?, ?, ?)')
        .run(followingId, 'follow', followerId);
      
      const io = req.app.get('io');
      io.to(`user_${followingId}`).emit('notification', { type: 'follow', senderId: followerId });

      res.json({ following: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error following user' });
  }
});

// Search Users
router.get('/search/:query', authenticateToken, (req: AuthRequest, res) => {
  const query = `%${req.params.query}%`;
  try {
    const users = db.prepare('SELECT id, username, profilePicture FROM users WHERE username LIKE ? LIMIT 10').all(query);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

export default router;
