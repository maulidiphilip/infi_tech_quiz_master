import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { submitQuizSchema } from '@/validations/quiz'
import { eq, and } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizAttempts, quizzes, userAnswers } from '@/src/schema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = submitQuizSchema.parse({
      quizId: id,
      answers: body.answers
    })

    // Fetch quiz details
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))

    if (!quiz || !quiz.isActive) {
      return NextResponse.json({ error: 'Quiz not found or inactive' }, { status: 404 })
    }

    // Fetch questions for grading
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, id))

    // Check if user has exceeded max attempts
    const existingAttempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, id),
          eq(quizAttempts.userId, session.user.id)
        )
      )

    if (quiz.maxAttempts && existingAttempts.length >= quiz.maxAttempts) {
      return NextResponse.json({ error: 'Maximum attempts exceeded' }, { status: 403 })
    }

    // Calculate score
    
    // Create quiz attempt record
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        quizId: id,
        userId: session.user.id,
        score: 0, // Will update after calculation
        passed: false, // Will update after calculation
        completedAt: new Date()
      })
      .returning({ id: quizAttempts.id })

    // Grade the quiz
    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    for (const question of quizQuestions) {
      totalPoints += question.points
      
      const userAnswer = validatedData.answers.find(a => a.questionId === question.id)
      const answer = userAnswer?.answer || ''
      
      // Simple grading logic - exact match for correct answer
      const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      const pointsEarned = isCorrect ? question.points : 0
      earnedPoints += pointsEarned

      gradedAnswers.push({
        attemptId: attempt.id,
        questionId: question.id,
        answer,
        isCorrect,
        pointsEarned,
      })
    }

    // Insert user answers
    await db.insert(userAnswers).values(gradedAnswers)

    // Calculate score and determine pass/fail
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= quiz.passingScore

    // Update attempt with results
    await db
      .update(quizAttempts)
      .set({
        score,
        totalPoints,
        earnedPoints,
        passed,
        completedAt: new Date(),
      })
      .where(eq(quizAttempts.id, attempt.id))

    return NextResponse.json({
      score,
      totalPoints,
      earnedPoints,
      passed,
      passingScore: quiz.passingScore,
    })
  } catch (error: unknown) {
    console.error('Error submitting quiz:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as any).errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

