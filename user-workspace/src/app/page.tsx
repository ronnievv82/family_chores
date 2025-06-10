'use client'

import { useState } from 'react'
import { useFamily } from '@/contexts/family-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import AdminPanel from './components/admin-panel'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  const [view, setView] = useState<'today' | 'week' | 'admin'>('today')
  const { familyMembers, toggleChore } = useFamily()
  const [isToggling, setIsToggling] = useState<{ memberId: string; choreId: string } | null>(null)

  const handleToggleChore = async (memberId: string, choreId: string) => {
    setIsToggling({ memberId, choreId })
    try {
      await toggleChore(memberId, choreId)
    } finally {
      setIsToggling(null)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary/20 to-accent/20 transition-all duration-500'>
      <header className='sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 text-primary-foreground shadow-sm backdrop-blur-sm transition-all duration-300'>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-bold transition-colors duration-300 hover:text-primary'>
            🏠 Family Chore Tracker
          </h1>
          <p className='text-sm text-primary-foreground/80'>{new Date().toLocaleDateString()}</p>
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
        ) : view === 'today' ? (
          <div className='grid grid-cols-1 gap-6 duration-500 animate-in fade-in slide-in-from-bottom md:grid-cols-3'>
            {familyMembers.map((member) => (
              <Card
                key={member.id}
                className='p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'
              >
                <div className='mb-4 flex items-center gap-4'>
                  <Avatar className='h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40'>
                    <AvatarFallback className={`${member.color} transition-colors duration-300`}>
                      <span className='text-lg font-semibold text-white'>{member.initial}</span>
                    </AvatarFallback>
                  </Avatar>
                  <h2 className='text-xl font-semibold transition-colors duration-300 hover:text-primary'>
                    {member.name}
                  </h2>
                </div>
                {member.chores.length === 0 ? (
                  <p className='italic text-muted-foreground duration-300 animate-in fade-in'>
                    No chores assigned yet!
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {member.chores.map((chore) => (
                      <li
                        key={chore.id}
                        className='flex items-center justify-between rounded-md p-2 transition-all duration-300 hover:bg-primary/5'
                      >
                        <span
                          className={`transition-all duration-300 ${
                            chore.completed ? 'text-muted-foreground line-through' : ''
                          }`}
                        >
                          {chore.name}
                        </span>
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
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 duration-500 animate-in fade-in slide-in-from-bottom'>
            <h2 className='text-2xl font-bold text-primary-foreground transition-colors duration-300 hover:text-primary'>
              This Week&apos;s Schedule
            </h2>
            {familyMembers.map((member) => (
              <Card
                key={member.id}
                className='p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg'
              >
                <div className='mb-4 flex items-center gap-4'>
                  <Avatar className='h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40'>
                    <AvatarFallback className={`${member.color} transition-colors duration-300`}>
                      <span className='text-lg font-semibold text-white'>{member.initial}</span>
                    </AvatarFallback>
                  </Avatar>
                  <h2 className='text-xl font-semibold transition-colors duration-300 hover:text-primary'>
                    {member.name}
                  </h2>
                </div>
                {member.chores.length === 0 ? (
                  <p className='italic text-muted-foreground duration-300 animate-in fade-in'>
                    No chores scheduled this week!
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {member.chores.map((chore) => (
                      <div
                        key={chore.id}
                        className='flex items-center justify-between rounded-md p-2 transition-all duration-300 hover:bg-primary/5'
                      >
                        <div>
                          <h3
                            className={`transition-all duration-300 ${
                              chore.completed ? 'text-muted-foreground line-through' : 'font-medium'
                            }`}
                          >
                            {chore.name}
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            Due: {chore.dueDate.toLocaleDateString()}
                          </p>
                        </div>
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
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
