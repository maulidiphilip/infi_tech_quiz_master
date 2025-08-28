# 🚀 Production Deployment Guide

## Prerequisites
- Neon PostgreSQL database
- Vercel or Render account
- Environment variables configured

## Environment Variables Required
```env
DATABASE_URL=your_neon_postgresql_connection_string
NEXTAUTH_URL=https://your-deployed-app.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key
NODE_ENV=production
```

## Vercel Deployment

### 1. Connect to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. Configure Environment Variables
In Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all required environment variables
- Ensure `NEXTAUTH_URL` matches your Vercel domain

### 3. Database Setup
```bash
# Run these commands after deployment
npx drizzle-kit migrate
npm run create-users
npm run create-quizzes
```

## Render Deployment

### 1. Create Web Service
- Connect your GitHub repository
- Build Command: `npm run build`
- Start Command: `npm start`

### 2. Environment Variables
Add in Render dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your Render app URL)
- `NEXTAUTH_SECRET`
- `NODE_ENV=production`

### 3. Database Initialization
Use Render's shell to run:
```bash
npm run db:migrate
npm run create-users
npm run create-quizzes
```

## Post-Deployment Checklist
- [ ] Database tables created
- [ ] Demo users created
- [ ] Sample quizzes loaded
- [ ] Authentication working
- [ ] All routes accessible
- [ ] Admin and student flows tested

## Demo Credentials
- **Admin**: admin@example.com / admin123
- **Student**: student@example.com / student123

## Production Considerations
- Update demo credentials for security
- Configure proper SSL certificates
- Set up monitoring and logging
- Regular database backups
- Performance optimization

The Quiz Management System is production-ready! 🎉
