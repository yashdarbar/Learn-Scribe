"use client"

import type React from "react"

// import { BlogSection } from "@/components/dashboard/blog-section"
// import { PdfSection } from "@/components/dashboard/pdf-section"
import { BlogSection } from "@/components/dashboard/blog-section"
import { PdfSection } from "@/components/dashboard/pdf-section"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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
      <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl gap-4 sm:gap-0">
        <div className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)] flex-1 min-w-0">
          <span className="block sm:hidden text-base">Welcome back,</span>
          <span className="hidden sm:inline">Welcome back, </span>
          <span className="block sm:inline">{user?.user_metadata?.first_name || user?.email || "User"}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
          <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
            <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10 w-8 h-8 sm:w-10 sm:h-10">
              <span className="text-sm sm:text-lg font-semibold text-white">{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</span>
            </Avatar>
          </div>
          <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
  <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
  <Button
    variant="ghost"
    size="icon" // <-- change from "sm" to "icon" if supported
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
    <LogOut className="w-4 h-4" />  {/* consistent icon size */}
  </Button>
</span>

        </div>
      </header>

      {/* ✅ RESPONSIVE Main Layout */}
      <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stack vertically, Tablet+: Side by side */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 h-full">
            <div className="w-full lg:w-1/2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              <PdfSection />
            </div>
            <div className="w-full lg:w-1/2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              <BlogSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// "use client"

// import type React from "react"

// import { BlogSection } from "@/components/dashboard/blog-section"
// import { PdfSection } from "@/components/dashboard/pdf-section"
// import { Avatar } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { LogOut } from "lucide-react"
// import { useRouter } from "next/navigation"
// // import { createClient } from "@/lib/supabase-browser"/
// import { createClient } from "@/utils/supabase/client"
// import { useState, useEffect } from "react"

// // User interface
// interface User {
//   id: string;
//   email?: string;
//   user_metadata?: {
//     first_name?: string;
//     last_name?: string;
//   };
// }

// const RetroGrid = ({ angle = 65, cellSize = 60, opacity = 0.3, lineColor = "rgba(120,119,198,0.3)" }) => {
//   const gridStyles = {
//     "--grid-angle": `${angle}deg`,
//     "--cell-size": `${cellSize}px`,
//     "--opacity": opacity,
//     "--line-color": lineColor,
//   } as React.CSSProperties

//   return (
//     <div className="pointer-events-none absolute size-full overflow-hidden [perspective:200px]" style={{ opacity }}>
//       <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]" style={gridStyles}>
//         <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
//       </div>
//       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
//     </div>
//   )
// }

// export default function Dashboard() {
//   const router = useRouter()
//   const supabase = createClient()
//   const [loading, setLoading] = useState(false)
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const getUser = async () => {
//       const { data, error } = await supabase.auth.getUser()
//       if (error) {
//         console.error("Error fetching user:", error)
//         return
//       }
//       setUser(data.user || null)
//       console.log("User data:", data.user)
//     }
//     getUser()
//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_IN") {
//         setUser(session?.user || null)
//       } else if (event === "SIGNED_OUT") {
//         setUser(null)
//         router.push("/login")
//       }
//     })
//     return () => {
//       authListener.subscription.unsubscribe()
//     }
//   }, [supabase, router])

//   const handleLogout = async () => {
//     setLoading(true)
//     try {
//       const { error } = await supabase.auth.signOut()
//       if (!error) {
//         router.push("/login")
//       }
//     } catch (error) {
//       console.log("Logout error:", error)
//       // For demo purposes, still redirect even if there's an error
//       router.push("/login")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden">
//       <RetroGrid />
//       <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

//       {/* Header */}
//       <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
//         <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.7)_100%)]">
//           Welcome back, {user?.user_metadata?.first_name || user?.email || "User"}
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="relative inline-block overflow-hidden rounded-full p-[1px]">
//             <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
//             <Avatar className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10">
//               <span className="text-lg font-semibold text-white">{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</span>
//             </Avatar>
//           </div>
//           <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
//             <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-orange-200/20 rounded-full" />
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               disabled={loading}
//               className="relative bg-gradient-to-tr from-zinc-300/5 via-purple-400/20 to-transparent border border-white/10 hover:from-zinc-300/10 hover:via-purple-400/30 text-white"
//               aria-label="Logout"
//             >
//               <LogOut className="w-4 h-4" />
//             </Button>
//           </span>
//         </div>
//       </header>

//       {/* Main Split Layout */}
//       <main className="relative z-10 flex-1 flex flex-col md:flex-row p-8 gap-8">
//         <div className="w-full md:w-1/2">
//           <PdfSection />
//         </div>
//         <div className="w-full md:w-1/2">
//           <BlogSection />
//         </div>
//       </main>
//     </div>
//   )
// }



// import { BlogSection } from "@/components/dashboard/blog-section";
// import { PdfSection } from "@/components/dashboard/pdf-section";
// import { Avatar } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { LogOut } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { supabaseBrowser } from "@/lib/supabase-browser";
// import { useState } from "react";

// const mockUser = {
//   name: "Jane Doe",
//   avatar: undefined,
// };

// export default function Dashboard() {
//   const router = useRouter();
//   const supabase = supabaseBrowser();
//   const [loading, setLoading] = useState(false);

//   const handleLogout = async () => {
//     setLoading(true);
//     try {
//       await supabase.auth.signOut();
//       router.push("/login");
//     } catch (error) {
//       // handle error
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col">
//       {/* Header */}
//       <header className="flex items-center justify-between px-8 py-6 border-b bg-white/80 shadow-sm">
//         <div className="text-xl font-bold tracking-tight">Welcome back, {mockUser.name}</div>
//         <div className="flex items-center gap-4">
//           <Avatar>
//             {/* Optionally add user image here */}
//             <span className="text-lg font-semibold bg-blue-100 text-blue-700 rounded-full px-3 py-1">{mockUser.name[0]}</span>
//           </Avatar>
//           <Button variant="outline" size="icon" onClick={handleLogout} disabled={loading} aria-label="Logout">
//             <LogOut className="w-5 h-5" />
//           </Button>
//         </div>
//       </header>
//       {/* Main Split Layout */}
//       <main className="flex-1 flex flex-col md:flex-row">
//         <div className="w-full md:w-1/2 flex items-stretch">
//           <BlogSection />
//         </div>
//         <Separator orientation="vertical" className="hidden md:block" />
//         <div className="w-full md:w-1/2 flex items-stretch">
//           <PdfSection />
//         </div>
//       </main>
//     </div>
//   );
// }