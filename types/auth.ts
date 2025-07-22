import { User, Session } from '@supabase/auth-helpers-nextjs'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

export interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string) => Promise<void>
}