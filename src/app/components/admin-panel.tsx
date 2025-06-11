'use client'

import { useState } from 'react'
import { useFamily } from '@/contexts/family-context'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import type { ChoreTemplate } from '@/types'

export default function AdminPanel() {
  const {
    familyMembers,
    choreTemplates,
    addFamilyMember,
    addChoreTemplate,
    deleteChoreTemplate,
    assignChoreFromTemplate,
    isLoading,
    error,
  } = useFamily()

  const [newMemberName, setNewMemberName] = useState('')
  const [newChore, setNewChore] = useState<Partial<ChoreTemplate>>({
    days: [],
    recurrence: 'daily',
  })
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [assigningTemplate, setAssigningTemplate] = useState<{
    templateId: string
    templateName: string
  } | null>(null)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handleAddMember = async () => {
    if (!newMemberName.trim() || isLoading[`addMember-${newMemberName}`]) return

    try {
      await addFamilyMember(newMemberName)
      setNewMemberName('')
    } catch (err) {
      // Error is handled by the context
    }
  }

  const handleAddChore = async () => {
    if (!newChore.name?.trim() || isLoading[`addTemplate-${newChore.name}`]) return

    try {
      await addChoreTemplate(newChore as Omit<ChoreTemplate, 'id'>)
      setNewChore({
        days: [],
        recurrence: 'daily',
      })
    } catch (error) {
      // Error is handled by the context
    }
  }

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      await deleteChoreTemplate(templateToDelete)
      setTemplateToDelete(null)
    }
  }

  const handleAssignTemplate = async (memberId: string) => {
    if (assigningTemplate) {
      await assignChoreFromTemplate(assigningTemplate.templateId, memberId)
      setAssigningTemplate(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler()
    }
  }

  return (
    <div className='p-6 duration-500 animate-in fade-in'>
      <h2 className='mb-6 text-2xl font-bold'>Admin Panel</h2>
      <Tabs defaultValue='members'>
        <TabsList className='mb-4'>
          <TabsTrigger value='members'>Family Members</TabsTrigger>
          <TabsTrigger value='chores'>Chore Templates</TabsTrigger>
        </TabsList>

        <TabsContent value='members'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Add Family Member</h3>
              <div className='flex gap-4'>
                <Input
                  placeholder='Enter name'
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddMember)}
                  disabled={isLoading[`addMember-${newMemberName}`]}
                  aria-invalid={error ? 'true' : undefined}
                  aria-label='New family member name'
                />
                <Button
                  onClick={handleAddMember}
                  disabled={isLoading[`addMember-${newMemberName}`] || !newMemberName.trim()}
                >
                  {isLoading[`addMember-${newMemberName}`] ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
              {error && <p className='animate-shake text-sm text-destructive'>{error}</p>}
            </div>

            <div>
              <h3 className='mb-4 text-lg font-semibold'>Family Members</h3>
              {familyMembers.length === 0 ? (
                <p className='italic text-muted-foreground'>No family members added yet</p>
              ) : (
                <div className='grid grid-cols-1 gap-4 duration-500 animate-in slide-in-from-left md:grid-cols-2'>
                  {familyMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className='flex items-center justify-between p-4 transition-all duration-300 hover:shadow-md'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`${member.color} flex h-8 w-8 items-center justify-center rounded-full text-white`}
                          >
                            {member.initial}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='chores'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Create Chore Template</h3>
              <div className='space-y-4'>
                <div>
                  <Label>Chore Name</Label>
                  <Input
                    placeholder='e.g., Make bed'
                    value={newChore.name || ''}
                    onChange={(e) => setNewChore({ ...newChore, name: e.target.value })}
                    disabled={isLoading[`addTemplate-${newChore.name}`]}
                    aria-label='Chore name'
                  />
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder='Additional details about the chore'
                    value={newChore.description || ''}
                    onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                    disabled={isLoading[`addTemplate-${newChore.name}`]}
                    aria-label='Chore description'
                  />
                </div>

                <div>
                  <Label>Recurrence Type</Label>
                  <Select
                    value={newChore.recurrence}
                    onValueChange={(value: 'daily' | 'weekly') =>
                      setNewChore({ ...newChore, recurrence: value })
                    }
                    disabled={isLoading[`addTemplate-${newChore.name}`]}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select recurrence' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly (specific days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newChore.recurrence === 'weekly' && (
                  <div>
                    <Label>Select Days</Label>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {weekDays.map((day) => (
                        <Button
                          key={day}
                          variant={newChore.days?.includes(day) ? 'default' : 'outline'}
                          onClick={() => {
                            const days = newChore.days || []
                            setNewChore({
                              ...newChore,
                              days: days.includes(day)
                                ? days.filter((d) => d !== day)
                                : [...days, day],
                            })
                          }}
                          disabled={isLoading[`addTemplate-${newChore.name}`]}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddChore}
                  className='w-full transition-all duration-300 hover:scale-[1.02]'
                  disabled={isLoading[`addTemplate-${newChore.name}`] || !newChore.name?.trim()}
                >
                  {isLoading[`addTemplate-${newChore.name}`] ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>

            <div>
              <h3 className='mb-4 text-lg font-semibold'>Chore Templates</h3>
              {choreTemplates.length === 0 ? (
                <p className='italic text-muted-foreground'>No chore templates created yet</p>
              ) : (
                <div className='grid grid-cols-1 gap-4 duration-500 animate-in slide-in-from-right'>
                  {choreTemplates.map((chore) => (
                    <Card key={chore.id}>
                      <CardContent className='p-4 transition-all duration-300 hover:shadow-md'>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-2'>
                            <h4 className='font-semibold'>{chore.name}</h4>
                            {chore.description && (
                              <p className='text-sm text-muted-foreground'>{chore.description}</p>
                            )}
                            <div className='flex gap-2 text-sm'>
                              <span className='text-muted-foreground'>Recurrence:</span>
                              <span>
                                {chore.recurrence === 'daily'
                                  ? 'Daily'
                                  : `Weekly (${chore.days.join(', ')})`}
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Select
                              onValueChange={(value) => handleAssignTemplate(value)}
                              onOpenChange={(open) => {
                                if (open) {
                                  setAssigningTemplate({
                                    templateId: chore.id,
                                    templateName: chore.name,
                                  })
                                }
                              }}
                            >
                              <SelectTrigger className='w-[140px]'>
                                <SelectValue placeholder='Assign to...' />
                              </SelectTrigger>
                              <SelectContent>
                                {familyMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setTemplateToDelete(chore.id)}
                              className='text-destructive'
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={templateToDelete !== null} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chore Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chore template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
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
