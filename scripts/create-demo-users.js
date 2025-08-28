const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const studentPassword = await bcrypt.hash('student123', 12);

    // Create users table if it doesn't exist
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

    // Delete existing demo users if they exist
    await sql`DELETE FROM users WHERE email IN ('admin@example.com', 'student@example.com')`;

    // Insert demo users
    await sql`
      INSERT INTO users (name, email, "hashedPassword", role) 
      VALUES 
        ('Admin User', 'admin@example.com', ${adminPassword}, 'ADMIN'),
        ('Student User', 'student@example.com', ${studentPassword}, 'STUDENT');
    `;

    console.log('✅ Demo users created successfully!');
    console.log('📝 You can now login with:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Student: student@example.com / student123');
    
  } catch (error) {
    console.error('❌ Failed to create demo users:', error);
  }
}

createDemoUsers();
