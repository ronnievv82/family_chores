'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

import type { Chore, FamilyMember } from '@/types'

interface FamilyContextType {
  familyMembers: FamilyMember[]
  setFamilyMembers: (members: FamilyMember[]) => void
  addFamilyMember: (name: string) => Promise<void>
  addChore: (memberId: string, chore: Omit<Chore, 'id'>) => Promise<void>
  toggleChore: (memberId: string, choreId: string) => Promise<void>
  isLoading: { [key: string]: boolean }
  error: string | null
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Emma',
      initial: 'E',
      color: 'bg-pink-500',
      chores: [
        {
          id: 'c1',
          name: 'Make bed',
          completed: false,
          dueDate: new Date(),
        },
      ],
    },
    {
      id: '2',
      name: 'Alex',
      initial: 'A',
      color: 'bg-blue-500',
      chores: [
        {
          id: 'c2',
          name: 'Clean room',
          completed: false,
          dueDate: new Date(),
        },
      ],
    },
    {
      id: '3',
      name: 'Sam',
      initial: 'S',
      color: 'bg-green-500',
      chores: [
        {
          id: 'c3',
          name: 'Do homework',
          completed: false,
          dueDate: new Date(),
        },
      ],
    },
  ])

  const setLoadingState = (key: string, loading: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: loading }))
  }

  const handleError = (error: unknown, message: string) => {
    // Log error silently in production
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error)
    }
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500']

  const addFamilyMember = async (name: string) => {
    const loadingKey = `addMember-${name}`
    setLoadingState(loadingKey, true)
    setError(null)

    try {
      const initial = name.charAt(0).toUpperCase()
      const color = colors[familyMembers.length % colors.length]

      // Optimistic update
      const newMember = {
        id: Date.now().toString(),
        name,
        initial,
        color,
        chores: [],
      }

      setFamilyMembers((prev) => [...prev, newMember])

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // await api.addFamilyMember(newMember)
    } catch (error) {
      // Rollback on error
      handleError(error, 'Failed to add family member')
      setFamilyMembers((prev) => prev.slice(0, -1))
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const addChore = async (memberId: string, chore: Omit<Chore, 'id'>) => {
    const loadingKey = `addChore-${memberId}`
    setLoadingState(loadingKey, true)
    setError(null)

    try {
      const newChore = { ...chore, id: Date.now().toString() }

      // Optimistic update
      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: [...member.chores, newChore],
              }
            : member
        )
      )

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // await api.addChore(memberId, newChore)
    } catch (error) {
      // Rollback on error
      handleError(error, 'Failed to add chore')
      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.slice(0, -1),
              }
            : member
        )
      )
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const toggleChore = async (memberId: string, choreId: string) => {
    const loadingKey = `toggleChore-${memberId}-${choreId}`
    setLoadingState(loadingKey, true)
    setError(null)

    // Store previous state for potential rollback
    const previousMembers = [...familyMembers]

    try {
      // Optimistic update
      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.map((chore) =>
                  chore.id === choreId ? { ...chore, completed: !chore.completed } : chore
                ),
              }
            : member
        )
      )

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // await api.updateChore(memberId, choreId)
    } catch (error) {
      // Rollback on error
      handleError(error, 'Failed to toggle chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  return (
    <FamilyContext.Provider
      value={{
        familyMembers,
        setFamilyMembers,
        addFamilyMember,
        addChore,
        toggleChore,
        isLoading,
        error,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
}
