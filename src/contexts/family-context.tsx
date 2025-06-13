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
    choNeed Help
    reId: string,
    updates: Partial<Omit<Chore, 'id'>>
  ) => Promise<void>
  isLoading: { [key: string]: boolean }
  error: string | null
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

const MEMBERS_STORAGE_KEY = 'family-chores-members'
const TEMPLATES_STORAGE_KEY = 'family-chores-templates'

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

const defaultTemplates: ChoreTemplate[] = [
  {
    id: 't1',
    name: 'Make bed',
    description: 'Make the bed neatly every morning',
    recurrence: 'daily',
    days: [],
  },
  {
    id: 't2',
    name: 'Clean room',
    description: 'Tidy up and vacuum the room',
    recurrence: 'weekly',
    days: ['Sat'],
  },
]

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
        setFamilyMembers(defaultMembers)
        setChoreTemplates(defaultTemplates)
      }
    }

    loadData()
  }, [])

  // Save to backend API whenever familyMembers changes
  useEffect(() => {
    const saveMembers = async () => {
      try {
        for (const member of familyMembers) {
          await fetch('http://localhost:3001/family-members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
          })
        }
      } catch (error) {
        console.error('Failed to save family members to backend:', error)
      }
    }
    if (familyMembers.length > 0) {
      saveMembers()
    }
  }, [familyMembers])

  // Save to backend API whenever choreTemplates changes
  useEffect(() => {
    const saveTemplates = async () => {
      try {
        for (const template of choreTemplates) {
          await fetch('http://localhost:3001/chore-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
          })
        }
      } catch (error) {
        console.error('Failed to save chore templates to backend:', error)
      }
    }
    if (choreTemplates.length > 0) {
      saveTemplates()
    }
  }, [choreTemplates])

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

  const addChoreTemplate = async (template: Omit<ChoreTemplate, 'id'>): Promise<ChoreTemplate> => {
    const loadingKey = `addTemplate-${template.name}`
    setLoadingState(loadingKey, true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/chore-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        throw new Error('Failed to add chore template')
      }

      const createdTemplate = await response.json()
      setChoreTemplates((prev) => [...prev, createdTemplate])
      return createdTemplate
    } catch (error) {
      handleError(error, 'Failed to add chore template')
      setChoreTemplates((prev) => prev.slice(0, -1))
      throw error
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const deleteChoreTemplate = async (id: string) => {
    const loadingKey = `deleteTemplate-${id}`
    setLoadingState(loadingKey, true)
    setError(null)

    const previousTemplates = [...choreTemplates]

    try {
      const response = await fetch(`http://localhost:3001/chore-templates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chore template')
      }

      setChoreTemplates((prev) => prev.filter((template) => template.id !== id))
    } catch (error) {
      handleError(error, 'Failed to delete chore template')
      setChoreTemplates(previousTemplates)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const assignChoreFromTemplate = async (templateId: string, memberId: string) => {
    const loadingKey = `assignTemplate-${templateId}-${memberId}`
    setLoadingState(loadingKey, true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:3001/family-members/${memberId}/chores/template/${templateId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to assign chore from template')
      }

      const newChore = await response.json()
      
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
    } catch (error) {
      handleError(error, 'Failed to assign chore from template')
      throw error
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
      const member = familyMembers.find((m) => m.id === memberId)
      if (!member) throw new Error('Member not found')

      const chore = member.chores.find((c) => c.id === choreId)
      if (!chore) throw new Error('Chore not found')

      const updatedChore = { ...chore, completed: !chore.completed }

      const response = await fetch(
        `http://localhost:3001/family-members/${memberId}/chores/${choreId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedChore),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle chore')
      }

      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.map((chore) =>
                  chore.id === choreId ? updatedChore : chore
                ),
              }
            : member
        )
      )
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
      const member = familyMembers.find((m) => m.id === fromMemberId)
      if (!member) throw new Error('Source member not found')

      const chore = member.chores.find((c) => c.id === choreId)
      if (!chore) throw new Error('Chore not found')

      const response = await fetch(
        `http://localhost:3001/family-members/${fromMemberId}/chores/${choreId}/reassign/${toMemberId}`,
        {
          method: 'PUT',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reassign chore')
      }

      setFamilyMembers((members) => {
        // First, find and remove the chore from the source member
        const updatedMembers = members.map((member) => {
          if (member.id === fromMemberId) {
            const updatedChores = member.chores.filter((chore) => chore.id !== choreId)
            return { ...member, chores: updatedChores }
          }
          return member
        })

        // Then, add the chore to the target member
        return updatedMembers.map((member) =>
          member.id === toMemberId
            ? {
                ...member,
                chores: [...member.chores, chore],
              }
            : member
        )
      })
    } catch (error) {
      handleError(error, 'Failed to reassign chore')
      setFamilyMembers(previousMembers)
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
      const member = familyMembers.find((m) => m.id === memberId)
      if (!member) throw new Error('Member not found')

      const chore = member.chores.find((c) => c.id === choreId)
      if (!chore) throw new Error('Chore not found')

      const updatedChore = { ...chore, ...updates }

      const response = await fetch(
        `http://localhost:3001/family-members/${memberId}/chores/${choreId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedChore),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to edit chore')
      }

      setFamilyMembers((members) =>
        members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                chores: member.chores.map((chore) =>
                  chore.id === choreId ? updatedChore : chore
                ),
              }
            : member
        )
      )
    } catch (error) {
      handleError(error, 'Failed to edit chore')
      setFamilyMembers(previousMembers)
    } finally {
      setLoadingState(loadingKey, false)
    }
  }

  const deleteFamilyMember = async (id: string) => {
    const loadingKey = `deleteMember-${id}`
    console.log('Deleting member with ID:', id)
    setLoadingState(loadingKey, true)
    setError(null)

    const previousMembers = [...familyMembers]

    try {
      const response = await fetch(`http://localhost:3001/family-members/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete family member')
      }

      setFamilyMembers((prev) => prev.filter((member) => member.id !== id))
    } catch (error) {
      handleError(error, 'Failed to delete family member')
      setFamilyMembers(previousMembers)
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
