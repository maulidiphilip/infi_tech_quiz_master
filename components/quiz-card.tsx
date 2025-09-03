"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Users, BookOpen, Edit, Trash2, Loader2 } from 'lucide-react'
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
  const router = useRouter()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')
    
    try {
      const response = await fetch(`/api/quiz/${quiz.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the page to update the quiz list
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete quiz')
      }
    } catch (err) {
      setError('Failed to delete quiz')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

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
      
      <CardFooter className="flex flex-col space-y-2">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showDeleteConfirm && (
          <Alert className="w-full">
            <AlertDescription>
              Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
            </AlertDescription>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </Alert>
        )}

        <div className="flex justify-between w-full">
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
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
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
        </div>
      </CardFooter>
    </Card>
  )
}
