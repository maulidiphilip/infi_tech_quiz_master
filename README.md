# Quiz Management System 

A modern, production-ready quiz management system built with Next.js 15, TypeScript, and modern web technologies.

## **Project Status: COMPLETE**

All core functionalities have been implemented and tested:

### **Admin Features**
- **Quiz Creation**: Create quizzes with multiple question types (Multiple Choice, True/False, Short Answer)
- **Quiz Management**: Full CRUD operations - create, read, update, delete quizzes
- **Question Management**: Add, edit, and reorder questions with customizable point values
- **Results Analytics**: View detailed quiz results and student performance
- **User Management**: Promote students to admin or demote admins to students
- **Dashboard**: Comprehensive admin dashboard with quiz overview
- **Time Limits**: Set optional time limits for quizzes
- **Passing Scores**: Configure minimum passing percentages
- **Attempt Limits**: Control maximum number of attempts per student

### Student Features
- **Quiz Taking**: Interactive quiz interface with real-time timer
- **Multiple Question Types**: Support for various question formats
- **Instant Results**: Immediate pass/fail feedback with detailed scoring
- **Progress Tracking**: View quiz history and performance
- **Responsive Design**: Optimized for desktop and mobile devices

### System Features
- **Authentication**: Secure login system with role-based access (Admin/Student)
- **User Registration**: Secure registration process (all new users default to Student role)
- **Role Management**: Admin-controlled user promotion/demotion system
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Validation**: Comprehensive input validation using Zod
- **Dark Mode**: Built-in theme switching
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean interface using Tailwind CSS and shadcn/ui components

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4.1
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # You can generate migrations using drizzle-kit generate command 
   npx drizzle-kit generate
   
   # Apply migrations
   npx drizzle-kit migrate

   # Alternatively, you can push changes directly to the database using
   npx drizzle-kit push

   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
quiz-management-system/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin-only pages
│   │   ├── quiz/           # Quiz management
│   │   └── users/          # User role management
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   └── quiz/           # Quiz endpoints
│   ├── auth/               # Authentication pages
│   └── quiz/               # Student quiz pages
├── components/             # Reusable UI components
│   └── ui/                # shadcn/ui components
├── src/                   # Core application files
│   ├── db.ts             # Database connection
│   └── schema.ts         # Drizzle schema definitions
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── validations/           # Zod validation schemas
├── migrations/            # Database migrations
├── public/                # Static assets
└── package.json
```

## 🎯 Usage

### Admin Workflow
1. Sign in with admin credentials
2. Create new quizzes from the dashboard
3. Add questions with various types and point values
4. Set quiz parameters (time limits, passing scores, max attempts)
5. Activate quizzes for student access
6. Monitor student performance
7. Manage user roles (promote students to admin)
8. Edit or delete existing quizzes

### Student Workflow
1. Register for a new account (automatically assigned Student role)
2. Sign in with student credentials
3. View available quizzes on dashboard
4. Take quizzes with real-time timer
5. Submit answers and receive instant results
6. View performance history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/auth/register` - User registration (defaults to Student role)

### Quiz Management
- `GET /api/quiz` - List all quizzes
- `POST /api/quiz` - Create new quiz (Admin only)
- `GET /api/quiz/[id]` - Get quiz details
- `PUT /api/quiz/[id]` - Update quiz (Admin only)
- `DELETE /api/quiz/[id]` - Delete quiz (Admin only)
- `POST /api/quiz/[id]/submit` - Submit quiz answers

### User Management
- `GET /api/admin/users` - List all users (Admin only)
- `PUT /api/admin/users/[id]` - Update user role (Admin only)

## 🗄 Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **quizzes** - Quiz definitions and settings
- **questions** - Individual quiz questions
- **quiz_attempts** - Student quiz submissions
- **user_answers** - Individual question responses

### Key Relationships
- Users can create multiple quizzes (Admin)
- Users can have multiple quiz attempts (Student)
- Quizzes contain multiple questions
- Attempts contain multiple user answers

## 🔐 Security Features

- **Authentication**: Secure session management with NextAuth.js
- **Authorization**: Role-based access control (Admin/Student)
- **Secure Registration**: All new users default to Student role (no public admin registration)
- **Admin-Controlled Promotions**: Only existing admins can promote users to admin
- **Self-Protection**: Admins cannot demote themselves accidentally
- **Input Validation**: Comprehensive validation using Zod
- **SQL Injection Protection**: Type-safe queries with Drizzle ORM
- **Environment Variables**: Secure configuration management

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System-based theme switching
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: User-friendly error messages
- **Real-time Timer**: Visual countdown for timed quizzes

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🧪 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:generate  # Generate database migrations
npm run db:migrate   # Apply database migrations
npm run db:studio    # Open Drizzle Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the codebase for implementation examples

## 🔮 Future Enhancements

- **Analytics Dashboard**: Detailed quiz performance analytics
- **Question Bank**: Reusable question library
- **Bulk Import**: CSV/Excel question import functionality
- **Advanced Grading**: Partial credit and weighted scoring
- **Notifications**: Email notifications for quiz results
- **Mobile App**: React Native companion app
- **Integration**: LMS integration capabilities

---

Built by INFI-TECH Engineering Team
