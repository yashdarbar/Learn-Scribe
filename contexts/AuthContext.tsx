// contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
// import { supabaseBrowser } from '@/lib/supabase-browser'
import { createClient } from '@/utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  // const supabase = supabaseBrowser()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async (): Promise<void> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Unexpected error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const value: AuthContextType = {
    user,
    session,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
