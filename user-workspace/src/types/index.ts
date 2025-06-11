export interface Chore {
  id: string
  name: string
  description?: string
  completed: boolean
  dueDate: Date
}

export interface ChoreTemplate {
  id: string
  name: string
  description?: string
  assignedTo?: string
  recurrence: 'daily' | 'weekly'
  days: string[]
}

export interface FamilyMember {
  id: string
  name: string
  initial: string
  color: string
  chores: Chore[]
}
