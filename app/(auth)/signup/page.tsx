// eslint-disable-file @typescript-eslint/no-unused-vars
"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { AuthForm } from "@/components/auth-form"
import { supabaseBrowser } from "@/lib/supabase-browser";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

export default function SignUpPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const supabase = supabaseBrowser();

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
        // emailRedirectTo: `${window.location.origin}/auth/callback`
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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <AuthForm mode="signup" onSubmit={handleSignup} />
      </div>
    </div>
  )
}


// import { GalleryVerticalEnd } from "lucide-react"

// import { AuthForm } from "@/components/auth-form"

// export default function SignUp() {
//   return (
//     <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
//       <div className="flex w-full max-w-sm flex-col gap-6">
//         <a href="#" className="flex items-center gap-2 self-center font-medium">
//           <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
//             <GalleryVerticalEnd className="size-4" />
//           </div>
//           Acme Inc.
//         </a>
//         <AuthForm mode="signup"/>
//       </div>
//     </div>
//   )
// }
