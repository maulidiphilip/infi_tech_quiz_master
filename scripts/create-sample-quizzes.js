const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function createSampleQuizzes() {
  try {
    console.log('🚀 Creating sample quizzes...');

    // Get admin user ID
    const [adminUser] = await sql`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`;
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create demo users first.');
      return;
    }

    const adminId = adminUser.id;

    // Create Quiz 1: JavaScript Fundamentals
    const [quiz1] = await sql`
      INSERT INTO quizzes (title, description, "createdById", "isActive", "timeLimit", "passingScore", "maxAttempts")
      VALUES (
        'JavaScript Fundamentals Quiz',
        'Test your knowledge of basic JavaScript concepts including variables, functions, and data types.',
        ${adminId},
        true,
        15,
        70,
        3
      )
      RETURNING id
    `;

    // Questions for Quiz 1
    const quiz1Questions = [
      {
        question: 'What is the correct way to declare a variable in JavaScript?',
        type: 'MULTIPLE_CHOICE',
        options: ['var myVariable;', 'variable myVariable;', 'v myVariable;', 'declare myVariable;'],
        correctAnswer: 'var myVariable;',
        points: 2,
        order: 1
      },
      {
        question: 'Which of the following is NOT a JavaScript data type?',
        type: 'MULTIPLE_CHOICE',
        options: ['String', 'Boolean', 'Integer', 'Number'],
        correctAnswer: 'Integer',
        points: 2,
        order: 2
      },
      {
        question: 'JavaScript is case-sensitive.',
        type: 'TRUE_FALSE',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 1,
        order: 3
      },
      {
        question: 'What does the "===" operator do in JavaScript?',
        type: 'MULTIPLE_CHOICE',
        options: ['Assigns a value', 'Compares values only', 'Compares values and types', 'Creates a function'],
        correctAnswer: 'Compares values and types',
        points: 2,
        order: 4
      },
      {
        question: 'What keyword is used to create a function in JavaScript?',
        type: 'SHORT_ANSWER',
        options: null,
        correctAnswer: 'function',
        points: 3,
        order: 5
      }
    ];

    // Insert questions for Quiz 1
    for (const q of quiz1Questions) {
      await sql`
        INSERT INTO questions ("quizId", question, type, options, "correctAnswer", points, "order")
        VALUES (
          ${quiz1.id},
          ${q.question},
          ${q.type},
          ${JSON.stringify(q.options)},
          ${q.correctAnswer},
          ${q.points},
          ${q.order}
        )
      `;
    }

    // Create Quiz 2: Basic Mathematics
    const [quiz2] = await sql`
      INSERT INTO quizzes (title, description, "createdById", "isActive", "timeLimit", "passingScore", "maxAttempts")
      VALUES (
        'Basic Mathematics',
        'Simple arithmetic and algebra questions for beginners.',
        ${adminId},
        true,
        10,
        60,
        2
      )
      RETURNING id
    `;

    // Questions for Quiz 2
    const quiz2Questions = [
      {
        question: 'What is 15 + 27?',
        type: 'MULTIPLE_CHOICE',
        options: ['42', '41', '43', '40'],
        correctAnswer: '42',
        points: 1,
        order: 1
      },
      {
        question: '5 × 6 = 30',
        type: 'TRUE_FALSE',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 1,
        order: 2
      },
      {
        question: 'What is the square root of 64?',
        type: 'SHORT_ANSWER',
        options: null,
        correctAnswer: '8',
        points: 2,
        order: 3
      },
      {
        question: 'If x = 5, what is 2x + 3?',
        type: 'MULTIPLE_CHOICE',
        options: ['10', '13', '8', '15'],
        correctAnswer: '13',
        points: 2,
        order: 4
      },
      {
        question: 'What is 100 ÷ 4?',
        type: 'MULTIPLE_CHOICE',
        options: ['20', '25', '30', '35'],
        correctAnswer: '25',
        points: 1,
        order: 5
      }
    ];

    // Insert questions for Quiz 2
    for (const q of quiz2Questions) {
      await sql`
        INSERT INTO questions ("quizId", question, type, options, "correctAnswer", points, "order")
        VALUES (
          ${quiz2.id},
          ${q.question},
          ${q.type},
          ${JSON.stringify(q.options)},
          ${q.correctAnswer},
          ${q.points},
          ${q.order}
        )
      `;
    }

    console.log('✅ Sample quizzes created successfully!');
    console.log('📝 Created quizzes:');
    console.log('   1. JavaScript Fundamentals Quiz (5 questions, 15 min, 70% pass)');
    console.log('   2. Basic Mathematics (5 questions, 10 min, 60% pass)');
    console.log('🎯 You can now test the system with these sample quizzes!');
    
  } catch (error) {
    console.error('❌ Failed to create sample quizzes:', error);
  }
}

createSampleQuizzes();
