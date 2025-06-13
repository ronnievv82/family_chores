'use client'

import { useState, useMemo } from 'react'
import { useFamily } from '@/contexts/family-context'
import type { FamilyMember, Chore } from '@/types'
import { isTodaysChore } from '@/utils/date'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import AdminPanel from './components/admin-panel'
import { ThemeToggle } from '@/components/theme-toggle'

function HomePage() {
  const [view, setView] = useState<'today' | 'week' | 'admin'>('today')
  const { familyMembers, toggleChore, deleteFamilyMember } = useFamily()
  const [isToggling, setIsToggling] = useState<{ memberId: string; choreId: string } | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

  const handleToggleChore = async (memberId: string, choreId: string) => {
    setIsToggling({ memberId, choreId })
    try {
      await toggleChore(memberId, choreId)
    } finally {
      setIsToggling(null)
    }
  }

  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteFamilyMember(memberToDelete)
      setMemberToDelete(null)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary/20 to-accent/20 text-foreground transition-all duration-500'>
      <header className='sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300'>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-bold text-foreground transition-colors duration-300 hover:text-primary'>
            🏠 Family Chore Tracker
          </h1>
          <p className='text-sm text-muted-foreground'>{new Date().toLocaleDateString()}</p>
        </div>
        <nav className='flex items-center gap-2'>
          <ThemeToggle />
          <Button
            variant={view === 'today' ? 'secondary' : 'ghost'}
            onClick={() => setView('today')}
            className='transition-all duration-300 hover:scale-105'
          >
            Today&apos;s Chores
          </Button>
          <Button
            variant={view === 'week' ? 'secondary' : 'ghost'}
            onClick={() => setView('week')}
            className='transition-all duration-300 hover:scale-105'
          >
            This Week
          </Button>
          <Button
            variant={view === 'admin' ? 'secondary' : 'ghost'}
            onClick={() => setView('admin')}
            className='transition-all duration-300 hover:scale-105'
          >
            Admin Panel
          </Button>
        </nav>
      </header>

      <main className='container mx-auto p-6 transition-all duration-500'>
        {view === 'admin' ? (
          <AdminPanel />
        ) : (
          <div
            className={`grid grid-cols-1 ${
              view === 'today' ? 'md:grid-cols-3' : ''
            } gap-6 duration-500 animate-in fade-in slide-in-from-bottom`}
          >
            {view === 'week' && (
              <h2 className='text-2xl font-bold text-foreground transition-colors duration-300 hover:text-primary'>
                This Week&apos;s Schedule
              </h2>
            )}
            {familyMembers.map((member: FamilyMember) => {
              // Filter chores based on view
              const filteredChores = useMemo(() => {
                return member.chores.filter(chore => 
                  view === 'week' ? true : isTodaysChore(chore)
                )
              }, [member.chores, view])

              return (
              <Card
                key={member.id}
                className='p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'
              >
                <div className='mb-4 flex items-center gap-4'>
                  <Avatar className='h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40'>
                    <AvatarFallback className={`${member.color}`}>
                      <span className='text-lg font-semibold text-white'>{member.initial}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-1 items-center justify-between'>
                    <h2 className='text-xl font-semibold text-foreground transition-colors duration-300 hover:text-primary'>
                      {member.name}
                    </h2>
                  </div>
                </div>
                {filteredChores.length === 0 ? (
                  <p className='italic text-muted-foreground duration-300 animate-in fade-in'>
                    {view === 'today'
                      ? 'No chores assigned yet!'
                      : 'No chores scheduled this week!'}
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {filteredChores.map((chore: Chore) => (
                      <li
                        key={chore.id}
                        className='flex items-center justify-between rounded-md p-2 transition-all duration-300 hover:bg-primary/5'
                      >
                        <div className='flex flex-col gap-1'>
                          <span
                            className={`transition-all duration-300 ${
                              chore.completed
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            }`}
                          >
                            {chore.name}
                          </span>
                          {view === 'week' && (
                            <p className='text-sm text-muted-foreground'>
                              Due: {chore.dueDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleToggleChore(member.id, chore.id)}
                            disabled={
                              isToggling?.memberId === member.id && isToggling?.choreId === chore.id
                            }
                            className='transition-all duration-300 hover:scale-110'
                          >
                            {isToggling?.memberId === member.id && isToggling?.choreId === chore.id
                              ? '...'
                              : chore.completed
                                ? '↩️'
                                : '✓'}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )})}
          </div>
        )}
      </main>

      <AlertDialog open={memberToDelete !== null} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this family member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HomePage
