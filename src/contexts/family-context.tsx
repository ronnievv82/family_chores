'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Chore, FamilyMember } from '@/types'

interface FamilyContextType {
  familyMembers: FamilyMember[]
  setFamilyMembers: (members: FamilyMember[]) => void
  addFamilyMember: (name: string) => Promise<void>
  deleteFamilyMember: (id: string) => Promise<void>
  addChore: (memberId: string, chore: Omit<Chore, 'id'>) => Promise<void>
  toggleChore: (memberId: string, choreId: string) => Promise<void>
  reassignChore: (fromMemberId: string, toMemberId: string, choreId: string) => Promise<void>
  editChore: (memberId: string, choreId: string, updates: Partial<Omit<Chore, 'id'>>) => Promise<void>
  isLoading: { [key: string]: boolean }
  error: string | null
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

const STORAGE_KEY = 'family-chores-data'

const defaultMembers: FamilyMember[] = [
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
]

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Convert date strings back to Date objects
        const members = parsed.map((member: FamilyMember) => ({
          ...member,
          chores: member.chores.map(chore => ({
            ...chore,
            dueDate: new Date(chore.dueDate)
          }))
        }))
        setFamilyMembers(members)
      } catch (error) {
        console.error('Failed to parse saved data:', error)
        setFamilyMembers(defaultMembers)
      }
    } else {
      setFamilyMembers(defaultMembers)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (familyMembers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(familyMembers))
    }
  }, [familyMembers])

  const setLoadingState = (key: string, loading: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: loading }))
  }

  const handleError = (error: unknown, message: string) => {
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

      const newMember = {
        id: Date.now().toString(),
        name,
        initial,
        color,
        chores: [],
      }

      setFamilyMembers((prev) => [...prev, newMember])
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
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

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
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

    const previousMembers = [...familyMembers]

    try {
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

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      handleError(error, 'Failed to toggle chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const reassignChore = async (fromMemberId: string, toMemberId: string, choreId: string) => {
    const loadingKey = `reassignChore-${fromMemberId}-${toMemberId}-${choreId}`
    setLoadingState(loadingKey, true)
    setError(null)

    const previousMembers = [...familyMembers]

    try {
      let choreToMove: Chore | undefined

      setFamilyMembers((members) => {
        // First, find and remove the chore from the source member
        const updatedMembers = members.map((member) => {
          if (member.id === fromMemberId) {
            const updatedChores = member.chores.filter((chore) => {
              if (chore.id === choreId) {
                choreToMove = chore
                return false
              }
              return true
            })
            return { ...member, chores: updatedChores }
          }
          return member
        })

        // Then, add the chore to the target member
        if (choreToMove) {
          return updatedMembers.map((member) =>
            member.id === toMemberId
              ? {
                  ...member,
                  chores: [...member.chores, choreToMove!],
                }
              : member
          )
        }

        return updatedMembers
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      handleError(error, 'Failed to reassign chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const editChore = async (
    memberId: string,
    choreId: string,
    updates: Partial<Omit<Chore, 'id'>>
  ) => {
    const loadingKey = `editChore-${memberId}-${choreId}`
    setLoadingState(loadingKey, true)
    setError(null)

    const previousMembers = [...familyMembers]

    try {
      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.map((chore) =>
                  chore.id === choreId ? { ...chore, ...updates } : chore
                ),
              }
            : member
        )
      )

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      handleError(error, 'Failed to edit chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const deleteFamilyMember = async (id: string) => {
    const loadingKey = `deleteMember-${id}`
    setLoadingState(loadingKey, true)
    setError(null)

    const previousMembers = [...familyMembers]

    try {
      setFamilyMembers((prev) => prev.filter((member) => member.id !== id))
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      handleError(error, 'Failed to delete family member')
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
        deleteFamilyMember,
        addChore,
        toggleChore,
        reassignChore,
        editChore,
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
