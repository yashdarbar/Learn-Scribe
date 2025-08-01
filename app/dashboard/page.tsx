"use client"

import type React from "react"

import { BlogSection } from "@/components/dashboard/blog-section"
import { PdfSection } from "@/components/dashboard/pdf-section"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"

// User interface
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
  };
}

const RetroGrid = ({ angle = 65, cellSize = 60, opacity = 0.3, lineColor = "rgba(120,119,198,0.3)" }) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--line-color": lineColor,
  } as React.CSSProperties

  return (
    <div className="pointer-events-none absolute size-full overflow-hidden [perspective:200px]" style={{ opacity }}>
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]" style={gridStyles}>
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Error fetching user:", error)
        return
      }
      setUser(data.user || null)
      console.log("User data:", data.user)
    }
    getUser()
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/login")
      }
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        router.push("/login")
      }
    } catch (error) {
      console.log("Logout error:", error)
      // For demo purposes, still redirect even if there's an error
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      {/* ✅ RESPONSIVE Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="text-base sm:text-lg lg:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)] flex-1 min-w-0 pr-4">
          <span className="truncate">
            Learn-Scribe
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
            <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10 w-8 h-8 sm:w-10 sm:h-10">
              <span className="text-sm sm:text-lg font-semibold text-white">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]}
              </span>
            </Avatar>
          </div>

          <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loading}
              aria-label="Logout"
              className="
                relative
                h-8 w-8 sm:h-10 sm:w-10 rounded-full
                bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent
                border border-white/10
                hover:from-zinc-300/10 hover:via-purple-400/30
                text-white flex items-center justify-center
                transition-all
                p-0
              "
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-geist bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] mb-4">
              Your Learning Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Transform documents into knowledge. Create content that resonates.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PdfSection />
            <BlogSection />
          </div>
        </div>
      </main>
    </div>
  )
}