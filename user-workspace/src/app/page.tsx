"use client"

import { useState } from "react"
import { useFamily } from "@/contexts/family-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminPanel from "./components/admin-panel"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [view, setView] = useState<"today" | "week" | "admin">("today")
  const { familyMembers, toggleChore, deleteFamilyMember } = useFamily()
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
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-accent/20 transition-all duration-500">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 p-4 flex items-center justify-between text-primary-foreground border-b shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold hover:text-primary transition-colors duration-300">
            🏠 Family Chore Tracker
          </h1>
          <p className="text-sm text-primary-foreground/80">
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant={view === "today" ? "secondary" : "ghost"}
            onClick={() => setView("today")}
            className="transition-all duration-300 hover:scale-105"
          >
            Today&apos;s Chores
          </Button>
          <Button 
            variant={view === "week" ? "secondary" : "ghost"}
            onClick={() => setView("week")}
            className="transition-all duration-300 hover:scale-105"
          >
            This Week
          </Button>
          <Button 
            variant={view === "admin" ? "secondary" : "ghost"}
            onClick={() => setView("admin")}
            className="transition-all duration-300 hover:scale-105"
          >
            Admin Panel
          </Button>
        </nav>
      </header>

      <main className="container mx-auto p-6 transition-all duration-500">
        {view === "admin" ? (
          <AdminPanel />
        ) : view === "today" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
            {familyMembers.map((member) => (
              <Card 
                key={member.id} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                    <AvatarFallback className={`${member.color} transition-colors duration-300`}>
                      <span className="text-white text-lg font-semibold">
                        {member.initial}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-between flex-1">
                    <h2 className="text-xl font-semibold hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFamilyMember(member.id)}
                      className="text-destructive hover:text-destructive/80 transition-all duration-300"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                {member.chores.length === 0 ? (
                  <p className="text-muted-foreground italic animate-in fade-in duration-300">
                    No chores assigned yet!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {member.chores.map((chore) => (
                      <li 
                        key={chore.id} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-primary/5 transition-all duration-300"
                      >
                        <span className={`transition-all duration-300 ${
                          chore.completed ? "line-through text-muted-foreground" : ""
                        }`}>
                          {chore.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleChore(member.id, chore.id)}
                          disabled={isToggling?.memberId === member.id && isToggling?.choreId === chore.id}
                          className="transition-all duration-300 hover:scale-110"
                        >
                          {isToggling?.memberId === member.id && isToggling?.choreId === chore.id ? (
                            "..."
                          ) : chore.completed ? (
                            "↩️"
                          ) : (
                            "✓"
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
            <h2 className="text-2xl font-bold text-primary-foreground hover:text-primary transition-colors duration-300">
              This Week&apos;s Schedule
            </h2>
            {familyMembers.map((member) => (
              <Card 
                key={member.id} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                    <AvatarFallback className={`${member.color} transition-colors duration-300`}>
                      <span className="text-white text-lg font-semibold">
                        {member.initial}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-between flex-1">
                    <h2 className="text-xl font-semibold hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFamilyMember(member.id)}
                      className="text-destructive hover:text-destructive/80 transition-all duration-300"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                {member.chores.length === 0 ? (
                  <p className="text-muted-foreground italic animate-in fade-in duration-300">
                    No chores scheduled this week!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {member.chores.map((chore) => (
                      <div 
                        key={chore.id} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-primary/5 transition-all duration-300"
                      >
                        <div>
                          <h3 className={`transition-all duration-300 ${
                            chore.completed ? "line-through text-muted-foreground" : "font-medium"
                          }`}>
                            {chore.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Due: {chore.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleChore(member.id, chore.id)}
                          disabled={isToggling?.memberId === member.id && isToggling?.choreId === chore.id}
                          className="transition-all duration-300 hover:scale-110"
                        >
                          {isToggling?.memberId === member.id && isToggling?.choreId === chore.id ? (
                            "..."
                          ) : chore.completed ? (
                            "↩️"
                          ) : (
                            "✓"
                          )}
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
