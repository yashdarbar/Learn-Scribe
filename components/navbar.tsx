"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Upload, BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"

interface NavbarProps {
  user?: any
}

// Separate component for navigation links to prevent hydration issues
function NavigationLinks() {
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        href="/pdf"
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
      >
        <Upload className="w-4 h-4" />
        <span>Upload PDF</span>
      </Link>

      <Link
        href="/blogs"
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
      >
        <BookOpen className="w-4 h-4" />
        <span>Blogs</span>
      </Link>

      <Link
        href="/blogs/my-blogs"
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        <span>My Blogs</span>
      </Link>
    </nav>
  )
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        router.push("/login")
      }
    } catch (error) {
      console.log("Logout error:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

        return (
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 bg-black backdrop-blur-xl shadow-xl">
      {/* Left side - Project name only */}
      <Link href="/dashboard" className="text-base sm:text-lg lg:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)] hover:opacity-80 transition-opacity">
        Learn-Scribe
      </Link>

                  {/* Right side - Navigation Links and Auth Buttons */}
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Navigation Links - Only show when user is logged in AND mounted */}
        {mounted && user && <NavigationLinks />}

        {/* Auth Buttons - Only render after component is mounted to prevent hydration mismatch */}
        {mounted && (
          <>
            {user ? (
              /* Logout Button - when user is logged in */
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={loading}
                className="
                  flex items-center gap-2
                  bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent
                  border border-white/10
                  hover:from-zinc-300/10 hover:via-purple-400/30
                  text-white
                  transition-all
                  px-4 py-2
                  rounded-lg
                "
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            ) : (
              /* Login and Signup Buttons - when user is not logged in */
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="
                      flex items-center gap-2
                      bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent
                      border border-white/10
                      hover:from-zinc-300/10 hover:via-purple-400/30
                      text-white
                      transition-all
                      px-4 py-2
                      rounded-lg
                    "
                  >
                    <span className="text-sm font-medium">Login</span>
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    variant="ghost"
                    className="
                      flex items-center gap-2
                      bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent
                      border border-white/10
                      hover:from-zinc-300/10 hover:via-purple-400/30
                      text-white
                      transition-all
                      px-4 py-2
                      rounded-lg
                    "
                  >
                    <span className="text-sm font-medium">Signup</span>
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}