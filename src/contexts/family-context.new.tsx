'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Chore, FamilyMember, ChoreTemplate } from '@/types'

interface FamilyContextType {
  familyMembers: FamilyMember[]
  choreTemplates: ChoreTemplate[]
  setFamilyMembers: (members: FamilyMember[]) => void
  setChoreTemplates: (templates: ChoreTemplate[]) => void
  addFamilyMember: (name: string) => Promise<void>
  deleteFamilyMember: (id: string) => Promise<void>
  addChore: (memberId: string, chore: Omit<Chore, 'id'>) => Promise<void>
  addChoreTemplate: (template: Omit<ChoreTemplate, 'id'>) => Promise<ChoreTemplate>
  deleteChoreTemplate: (id: string) => Promise<void>
  assignChoreFromTemplate: (templateId: string, memberId: string) => Promise<void>
  toggleChore: (memberId: string, choreId: string) => Promise<void>
  reassignChore: (fromMemberId: string, toMemberId: string, choreId: string) => Promise<void>
  unassignChore: (memberId: string, choreId: string) => Promise<void>
  editChore: (
    memberId: string,
    choreId: string,
    updates: Partial<Omit<Chore, 'id'>>
  ) => Promise<void>
  isLoading: { [key: string]: boolean }
  error: string | null
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [choreTemplates, setChoreTemplates] = useState<ChoreTemplate[]>([])

  // Load data from backend API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const membersResponse = await fetch('http://localhost:3001/family-members')
        const membersData = await membersResponse.json()
        const members = membersData.map((member: FamilyMember) => ({
          ...member,
          chores: member.chores.map((chore) => ({
            ...chore,
            dueDate: new Date(chore.dueDate),
          })),
        }))
        setFamilyMembers(members)

        const templatesResponse = await fetch('http://localhost:3001/chore-templates')
        const templatesData = await templatesResponse.json()
        setChoreTemplates(templatesData)
      } catch (error) {
        console.error('Failed to load data from backend:', error)
      }
    }

    loadData()
  }, [])

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
        name,
        initial,
        color,
        chores: [],
      }

      const response = await fetch('http://localhost:3001/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        throw new Error('Failed to add family member')
      }

      const createdMember = await response.json()
      setFamilyMembers((prev) => [...prev, createdMember])
    } catch (error) {
      handleError(error, 'Failed to add family member')
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const unassignChore = async (memberId: string, choreId: string) => {
    const loadingKey = `unassignChore-${memberId}-${choreId}`
    setLoadingState(loadingKey, true)
    setError(null)

    const previousMembers = [...familyMembers]

    try {
      const response = await fetch(
        `http://localhost:3001/family-members/${memberId}/chores/${choreId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to unassign chore')
      }

      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.filter((chore) => chore.id !== choreId),
              }
            : member
        )
      )
    } catch (error) {
      handleError(error, 'Failed to unassign chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  // ... rest of the functions ...

  return (
    <FamilyContext.Provider
      value={{
        familyMembers,
        choreTemplates,
        setFamilyMembers,
        setChoreTemplates,
        addFamilyMember,
        deleteFamilyMember,
        addChore,
        addChoreTemplate,
        deleteChoreTemplate,
        assignChoreFromTemplate,
        toggleChore,
        reassignChore,
        unassignChore,
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
