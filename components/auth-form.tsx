"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

interface AuthFormProps {
  className?: string
  mode: "login" | "signup"
  onSubmit?: (formData: AuthFormData) => Promise<void> | void
}

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

export function AuthForm({
  className,
  mode,
  onSubmit,
  ...props
}: AuthFormProps) {
  const isLogin = mode === "login"
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Basic validation
    if (!formData.email || !formData.password) {
      alert("Please fill in all required fields")
      return
    }

    if (!isLogin) {
      if (!formData.name) {
        alert("Please enter your full name")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match")
        return
      }
    }

    setIsLoading(true)

    try {
      // Prepare data based on mode
      const submitData: AuthFormData = {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : {
          name: formData.name,
          confirmPassword: formData.confirmPassword
        })
      }

      await onSubmit?.(submitData)
    } catch (error) {
      console.error("Auth error:", error)
      // Handle error (you might want to show a toast or error message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // Handle Google authentication
      // You can call your Google auth function here
      // console.log(`Google ${isLogin ? 'login' : 'signup'} clicked`)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

    } catch (error) {
      console.error("Google auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-gray-400">
            {isLogin
              ? "Sign in to your account to continue"
              : "Join us and start creating amazing content"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Button
              type="button"
              variant="default"
              className="w-full bg-black/20 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {isLogin ? "Login with Google" : "Sign up with Google"}
            </Button>
          </div>

          <div className="relative text-center text-sm">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/30 px-2 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                {/* {isLogin && (
                  <a
                    href="#"
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    Forgot your password?
                  </a>
                )} */}
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading
                ? (isLogin ? "Signing in..." : "Creating account...")
                : (isLogin ? "Login" : "Create Account")
              }
            </Button>
          </div>

          <div className="text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
