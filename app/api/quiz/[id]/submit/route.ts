import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { submitQuizSchema } from '@/validations/quiz'
import { eq, and } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizAttempts, quizzes, userAnswers } from '@/src/schema'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = submitQuizSchema.parse({
      quizId: params.id,
      answers: body.answers,
    })

    // Get quiz details
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, params.id))

    if (!quiz || !quiz.isActive) {
      return NextResponse.json({ error: 'Quiz not available' }, { status: 404 })
    }

    // Get all questions for this quiz
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, params.id))

    if (quizQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this quiz' }, { status: 404 })
    }

    // Check if user has exceeded max attempts
    const existingAttempts = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, params.id),
          eq(quizAttempts.userId, session.user.id)
        )
      )

    if (existingAttempts.length >= quiz.maxAttempts) {
      return NextResponse.json({ error: 'Maximum attempts exceeded' }, { status: 403 })
    }

    // Create quiz attempt
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        quizId: params.id,
        userId: session.user.id,
        startedAt: new Date(),
      })
      .returning()

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
  } catch (error: any) {
    console.error('Error submitting quiz:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
