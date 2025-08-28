import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { questions, quizzes } from "@/src/schema";
import { eq } from "drizzle-orm";
import { createQuizSchema } from "@/validations/quiz";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        timeLimit: quizzes.timeLimit,
        passingScore: quizzes.passingScore,
        isActive: quizzes.isActive,
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .where(
        session.user.role === "ADMIN" ? undefined : eq(quizzes.isActive, true)
      );

    // Get question counts for each quiz
    const quizzesWithCounts = await Promise.all(
      allQuizzes.map(async (quiz) => {
        const [questionCount] = await db
          .select({ count: questions.id })
          .from(questions)
          .where(eq(questions.quizId, quiz.id));

        return {
          ...quiz,
          questionsCount: questionCount?.count || 0,
          attemptsCount: 0,
        };
      })
    );

    return NextResponse.json(quizzesWithCounts);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createQuizSchema.parse(body);

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        ...validatedData,
        createdById: session.user.id,
      })
      .returning();

    // Insert questions if provided
    if (body.questions && body.questions.length > 0) {
      const questionsData = body.questions.map((q: any, index: number) => ({
        quizId: newQuiz.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        order: index + 1,
      }));

      await db.insert(questions).values(questionsData);
    }

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error: any) {
    console.error("Error creating quiz:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
