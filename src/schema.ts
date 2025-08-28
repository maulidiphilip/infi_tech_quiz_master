import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  hashedPassword: text('hashedPassword'),
  role: varchar('role', { length: 50 }).default('STUDENT').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Accounts table for NextAuth
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

// Sessions table for NextAuth
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: varchar('sessionToken', { length: 255 }).unique().notNull(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Verification tokens table for NextAuth
export const verificationTokens = pgTable('verificationTokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdById: uuid('createdById').notNull().references(() => users.id),
  isActive: boolean('isActive').default(true).notNull(),
  timeLimit: integer('timeLimit'), // in minutes
  passingScore: integer('passingScore').default(70).notNull(), // percentage
  maxAttempts: integer('maxAttempts').default(3).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quizId').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  type: varchar('type', { length: 50 }).default('MULTIPLE_CHOICE').notNull(), // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
  options: jsonb('options'), // For multiple choice questions
  correctAnswer: text('correctAnswer').notNull(),
  points: integer('points').default(1).notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Quiz attempts table
export const quizAttempts = pgTable('quizAttempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quizId').notNull().references(() => quizzes.id),
  userId: uuid('userId').notNull().references(() => users.id),
  score: integer('score'), // percentage
  totalPoints: integer('totalPoints'),
  earnedPoints: integer('earnedPoints'),
  passed: boolean('passed'),
  startedAt: timestamp('startedAt', { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp('completedAt', { mode: 'date' }),
  timeSpent: integer('timeSpent'), // in seconds
});

// User answers table
export const userAnswers = pgTable('userAnswers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attemptId').notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('questionId').notNull().references(() => questions.id),
  answer: text('answer').notNull(),
  isCorrect: boolean('isCorrect').notNull(),
  pointsEarned: integer('pointsEarned').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  quizzes: many(quizzes),
  quizAttempts: many(quizAttempts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [quizzes.createdById],
    references: [users.id],
  }),
  questions: many(questions),
  attempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  userAnswers: many(userAnswers),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [userAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
}));
