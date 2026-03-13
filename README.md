# SocialHub

A production-ready social media platform with real-time notifications, chat, and post sharing.

## Features

- User authentication and profiles
- Post creation with image uploads
- Real-time chat messaging
- Notifications system
- Follow/unfollow users
- Like and comment on posts
- Responsive design

## Tech Stack

- React 19
- TypeScript
- Express.js
- Socket.io (real-time features)
- SQLite (better-sqlite3)
- Tailwind CSS
- Vite

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Deployment

### Option 1: Render (Recommended - Free Tier Available)

1. Create account on [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the `render.yaml` configuration
5. Click "Create Web Service"
6. Your app will be live at `https://your-app.onrender.com`

### Option 2: Railway

1. Create account on [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy
5. Add environment variable: `PORT=3000`
6. Your app will be live with a Railway URL

### Option 3: Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login and create app:
   ```bash
   heroku login
   heroku create your-app-name
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```
4. Your app will be live at `https://your-app-name.herokuapp.com`

### Option 4: Docker (Any Platform)

1. Build the Docker image:
   ```bash
   docker build -t socialhub .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 socialhub
   ```

3. Deploy to any platform that supports Docker (AWS, Google Cloud, Azure, DigitalOcean, etc.)

### Option 5: VPS (DigitalOcean, Linode, AWS EC2)

1. SSH into your server
2. Install Node.js 18+
3. Clone your repository
4. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
5. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "socialhub" -- start
   pm2 save
   pm2 startup
   ```
6. Configure Nginx as reverse proxy (optional)

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
APP_URL=https://your-domain.com
NODE_ENV=production
```

## Production Build

To build for production:

```bash
npm run build
npm start
```

## Notes

- The SQLite database file will be created automatically on first run
- Uploads folder will store user-uploaded images
- For production, consider using a cloud storage service (AWS S3, Cloudinary) for images
- For production database, consider PostgreSQL or MySQL instead of SQLite

## License

MIT
