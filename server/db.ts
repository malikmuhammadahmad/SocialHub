import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('database.sqlite');
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profilePicture TEXT,
    bio TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    caption TEXT,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(postId, userId),
    FOREIGN KEY (postId) REFERENCES posts(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    followerId INTEGER NOT NULL,
    followingId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(followerId, followingId),
    FOREIGN KEY (followerId) REFERENCES users(id),
    FOREIGN KEY (followingId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    referenceId INTEGER,
    senderId INTEGER,
    readStatus INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (senderId) REFERENCES users(id)
  );
`);

// Add location column if it doesn't exist (for existing databases)
try {
  db.prepare('ALTER TABLE users ADD COLUMN location TEXT').run();
} catch (e) {
  // Column probably already exists
}

export default db;
