"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react";
import { AuthForm } from "@/components/auth-form"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

// --- RetroGrid copied from dashboard ---
const RetroGrid = ({ angle = 65, cellSize = 60, opacity = 0.3, lineColor = "rgba(120,119,198,0.3)" }) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--line-color": lineColor,
  } as React.CSSProperties;

  return (
    <div className="pointer-events-none absolute size-full overflow-hidden [perspective:200px]" style={{ opacity }}>
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]" style={gridStyles}>
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--line-color)_1px,transparent_0),linear-gradient(to_bottom,var(--line-color)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  );
};

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  const supabase = createClient();

  const getFriendlyErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return 'An error occurred. Please try again.'

    switch (errorMessage) {
      case 'Invalid login credentials':
        return 'Wrong email or password. Please try again.'
      case 'Email not confirmed':
        return 'Please check your email and confirm your account first.'
      case 'Too many requests':
        return 'Too many attempts. Please wait a moment and try again.'
      case 'User not found':
        return 'No account found with this email address.'
      default:
        return 'Login failed. Please check your credentials and try again.'
    }
  }

  const handleLogin = async (formData: AuthFormData) => {
    const { email, password } = formData
    setLoading(true)

    try {
      console.log('Starting login process...')

      // Clear any existing session first
      await supabase.auth.signOut()

      // Small delay to ensure signOut is processed
      await new Promise(resolve => setTimeout(resolve, 100))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login attempt result:', {
        user: data.user?.id,
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('Login error:', error)
        const userMessage = getFriendlyErrorMessage(error.message)
        toast.error(userMessage)
        return
      }

      if (data.user && data.session) {
        console.log('Login successful!')
        toast.success('Logged in successfully!')

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Use window.location for a hard redirect to ensure middleware processes the session
        console.log('Redirecting to dashboard...')
        window.location.href = '/dashboard'
      } else {
        console.error('Login failed - no user or session')
        toast.error('Login failed - please try again')
      }

    } catch (err) {
      console.error('Unexpected login error:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      <RetroGrid />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-xl bg-purple-500/30" />
              <div className="relative bg-gradient-to-r from-purple-600 to-purple-700 text-white flex size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-5" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Blog-Craft
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        <div className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
          <AuthForm mode="login" onSubmit={handleLogin} />
          {loading && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Signing you in...
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-purple-400 hover:text-purple-300 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}
