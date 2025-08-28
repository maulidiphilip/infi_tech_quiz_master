import { z } from 'zod'

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute').optional(),
  passingScore: z.number().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100').default(70),
  maxAttempts: z.number().min(1, 'Max attempts must be at least 1').default(3),
  isActive: z.boolean().default(true),
})

export const createQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']).default('MULTIPLE_CHOICE'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1').default(1),
  order: z.number().min(1, 'Order must be at least 1'),
})

export const submitQuizSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID'),
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    answer: z.string().min(1, 'Answer is required'),
  })),
})

export const updateQuizSchema = createQuizSchema.partial()

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>
