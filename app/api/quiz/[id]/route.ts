import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizzes } from '@/src/schema'

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
