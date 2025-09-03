import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizzes } from '@/src/schema'
import { createQuizSchema } from '@/validations/quiz'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1)

    if (!quiz.length) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const quizData = quiz[0]

    // Students can only see active quizzes
    if (session.user?.role !== 'ADMIN' && !quizData.isActive) {
      return NextResponse.json({ error: 'Quiz not available' }, { status: 403 })
    }

    // Fetch questions for the quiz
    const quizQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, id))
      .orderBy(questions.order)

    return NextResponse.json({
      ...quizData,
      questions: quizQuestions
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createQuizSchema.parse(body)

    // Check if quiz exists
    const existingQuiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1)

    if (!existingQuiz.length) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Update quiz
    const [updatedQuiz] = await db
      .update(quizzes)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        timeLimit: validatedData.timeLimit,
        passingScore: validatedData.passingScore,
        maxAttempts: validatedData.maxAttempts,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id))
      .returning()

    // Update questions if provided
    if (body.questions && Array.isArray(body.questions)) {
      // Delete existing questions
      await db.delete(questions).where(eq(questions.quizId, id))

      // Insert new questions
      if (body.questions.length > 0) {
        const questionsData = body.questions.map((q: any, index: number) => ({
          quizId: id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: index + 1,
        }))

        await db.insert(questions).values(questionsData)
      }
    }

    return NextResponse.json(updatedQuiz)
  } catch (error: unknown) {
    console.error('Error updating quiz:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as any).errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if quiz exists
    const existingQuiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1)

    if (!existingQuiz.length) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Delete questions first (foreign key constraint)
    await db.delete(questions).where(eq(questions.quizId, id))

    // Delete quiz
    await db.delete(quizzes).where(eq(quizzes.id, id))

    return NextResponse.json({ message: 'Quiz deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
