"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, BookOpen, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface QuizCardProps {
  quiz: {
    id: string
    title: string
    description: string | null
    timeLimit: number | null
    passingScore: number
    questionsCount: number
    attemptsCount: number
    isActive: boolean
  }
}

export function QuizCard({ quiz }: QuizCardProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <Card className={`transition-all hover:shadow-md ${!quiz.isActive ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          {!quiz.isActive && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              Inactive
            </span>
          )}
        </div>
        {quiz.description && (
          <CardDescription className="line-clamp-2">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {quiz.questionsCount} questions
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {quiz.timeLimit} min
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {quiz.attemptsCount} attempts
          </div>
        </div>
        
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">Passing Score: </span>
          <span className="font-medium">{quiz.passingScore}%</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {isAdmin ? (
          <div className="flex space-x-2 w-full">
            <Link href={`/admin/quiz/${quiz.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/admin/quiz/${quiz.id}/results`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Results
              </Button>
            </Link>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link href={`/quiz/${quiz.id}`} className="w-full">
            <Button className="w-full" disabled={!quiz.isActive}>
              {quiz.isActive ? 'Take Quiz' : 'Quiz Unavailable'}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
