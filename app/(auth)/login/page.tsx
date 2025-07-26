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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <AuthForm mode="login" onSubmit={handleLogin} />
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Signing you in...
          </div>
        )}
      </div>
    </div>
  )
}
// // eslint-disable-file @typescript-eslint/no-unused-vars
// "use client";

// import { GalleryVerticalEnd } from "lucide-react"
// import { useState } from "react";
// import { AuthForm } from "@/components/auth-form"
// import { supabaseBrowser } from "@/lib/supabase-browser"
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// interface AuthFormData {
//   name?: string
//   email: string
//   password: string
//   confirmPassword?: string
// }

// export default function SignIn() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const supabase = supabaseBrowser();

//   const getFriendlyErrorMessage = (errorMessage: string): string => {
//   // Handle cases where errorMessage might be undefined
//   if (!errorMessage) return 'An error occurred. Please try again.'

//   switch (errorMessage) {
//     case 'Invalid login credentials':
//       return 'Wrong email or password. Please try again.'
//     case 'Email not confirmed':
//       return 'Please check your email and confirm your account first.'
//     case 'Too many requests':
//       return 'Too many attempts. Please wait a moment and try again.'
//     case 'User not found':
//       return 'No account found with this email address.'
//     default:
//       return 'Login failed. Please check your credentials and try again.'
//   }
// }

//   const handleLogin = async (formData: AuthFormData) => {
//   const { email, password } = formData
//   setLoading(true)

//   try {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })
//     // console.log("errorr", error);

//     if (error) {
//       // Convert technical errors to user-friendly messages
//       console.log(error)
//       const userMessage = getFriendlyErrorMessage(error.message)
//       // console.log(error)
//       toast.error(userMessage)
//       return
//     }

//     // Only show success message if no error occurred
//     toast.success('Logged in successfully!')

//     // Redirect after successful login
//     router.push('/dashboard') // or wherever you want to redirect

//   } catch (err) {
//     // Handle any unexpected errors
//     toast.error('An unexpected error occurred. Please try again.')
//     console.error('Login error:', err)
//   } finally {
//     setLoading(false)
//   }
// }

//   return (
//     <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
//       <div className="flex w-full max-w-sm flex-col gap-6">
//         <a href="#" className="flex items-center gap-2 self-center font-medium">
//           <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
//             <GalleryVerticalEnd className="size-4" />
//           </div>
//           Acme Inc.
//         </a>
//         <AuthForm mode="login" onSubmit={handleLogin}/>
//       </div>
//     </div>
//   )
// }
