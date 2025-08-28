import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizzes } from '@/src/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, params.id))

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Check if student can access this quiz
    if (session.user.role !== 'ADMIN' && !quiz.isActive) {
      return NextResponse.json({ error: 'Quiz not available' }, { status: 403 })
    }

    const quizQuestions = await db
      .select({
        id: questions.id,
        question: questions.question,
        type: questions.type,
        options: questions.options,
        points: questions.points,
        order: questions.order,
      })
      .from(questions)
      .where(eq(questions.quizId, params.id))
      .orderBy(questions.order)

    return NextResponse.json({
      ...quiz,
      questions: quizQuestions,
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
