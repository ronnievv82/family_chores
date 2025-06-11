"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-9 h-9 hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:shadow-md hover:ring-2 hover:ring-primary/20 active:scale-95 group"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 text-yellow-500 dark:-rotate-90 dark:scale-0 group-hover:animate-theme-switch group-hover:text-yellow-400" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 text-blue-500 dark:rotate-0 dark:scale-100 group-hover:animate-theme-switch group-hover:text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
