// eslint-disable-file @typescript-eslint/no-unused-vars
"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { AuthForm } from "@/components/auth-form"
// import { supabaseBrowser } from "@/lib/supabase-browser";
import { createClient } from "@/utils/supabase/client"
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function SignUpPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (formData: AuthFormData) => {
  const { email, password, name } = formData
  setLoading(true)

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name,
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) {
      // const userMessage = getFriendlyErrorMessage(error.message)
      toast.error(error.message)
      return
    }

    toast.success('Account created! Please check your email to confirm.')

    // Redirect to login page or email confirmation page
    router.push('/login?message=Please check your email to confirm your account')
    // Or redirect to a dedicated confirmation page:
    // router.push('/auth/confirm-email')

  } catch (error: any) {
    toast.error('Failed to create account. Please try again.')
    console.error('Signup error:', error)
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
              Learn-Scribe
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join us and start creating amazing content</p>
        </div>

        <div className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl shadow-xl p-8">
          <AuthForm mode="signup" onSubmit={handleSignup} />
          {loading && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Creating your account...
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
