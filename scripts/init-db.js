const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        image TEXT,
        "hashedPassword" TEXT,
        role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255)
      );
    `;

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL
      );
    `;

    // Create verification tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS "verificationTokens" (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires TIMESTAMP NOT NULL
      );
    `;

    // Create quizzes table
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "createdById" UUID NOT NULL REFERENCES users(id),
        "isActive" BOOLEAN DEFAULT true NOT NULL,
        "timeLimit" INTEGER,
        "passingScore" INTEGER DEFAULT 70 NOT NULL,
        "maxAttempts" INTEGER DEFAULT 3 NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'MULTIPLE_CHOICE' NOT NULL,
        options JSONB,
        "correctAnswer" TEXT NOT NULL,
        points INTEGER DEFAULT 1 NOT NULL,
        "order" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create quiz attempts table
    await sql`
      CREATE TABLE IF NOT EXISTS "quizAttempts" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "quizId" UUID NOT NULL REFERENCES quizzes(id),
        "userId" UUID NOT NULL REFERENCES users(id),
        score INTEGER,
        "totalPoints" INTEGER,
        "earnedPoints" INTEGER,
        passed BOOLEAN,
        "startedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "completedAt" TIMESTAMP,
        "timeSpent" INTEGER
      );
    `;

    // Create user answers table
    await sql`
      CREATE TABLE IF NOT EXISTS "userAnswers" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "attemptId" UUID NOT NULL REFERENCES "quizAttempts"(id) ON DELETE CASCADE,
        "questionId" UUID NOT NULL REFERENCES questions(id),
        answer TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL,
        "pointsEarned" INTEGER DEFAULT 0 NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create demo users with hashed passwords
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const studentPassword = await bcrypt.hash('student123', 12);

    await sql`
      INSERT INTO users (name, email, "hashedPassword", role) 
      VALUES 
        ('Admin User', 'admin@example.com', ${adminPassword}, 'ADMIN'),
        ('Student User', 'student@example.com', ${studentPassword}, 'STUDENT')
      ON CONFLICT (email) DO NOTHING;
    `;

    console.log('✅ Database initialized successfully!');
    console.log('📝 Demo accounts created:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Student: student@example.com / student123');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initDatabase();
