"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";

interface HeaderProps {
  variant?: 'pdf' | 'blogs';
}

export default function Header({ variant = 'blogs' }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-detect variant based on pathname
  const detectedVariant = pathname.startsWith('/pdf') ? 'pdf' : 'blogs';
  const currentVariant = variant || detectedVariant;

  // Color scheme based on variant
  const colors = {
    pdf: {
      primary: 'purple',
      primaryHover: 'hover:bg-purple-600',
      primaryBg: 'bg-purple-600',
      primaryBorder: 'border-purple-500',
      primaryText: 'text-purple-400',
      primaryRing: 'focus:ring-purple-400',
      avatarBorder: 'border-purple-500/30',
      avatarBg: 'bg-purple-500/20'
    },
    blogs: {
      primary: 'blue',
      primaryHover: 'hover:bg-blue-600',
      primaryBg: 'bg-blue-600',
      primaryBorder: 'border-blue-500',
      primaryText: 'text-blue-400',
      primaryRing: 'focus:ring-blue-400',
      avatarBorder: 'border-blue-500/30',
      avatarBg: 'bg-blue-500/20'
    }
  };

  const colorScheme = colors[currentVariant];

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.first_name ||
           user.user_metadata?.full_name ||
           user.email?.split('@')[0] ||
           'User';
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 animate-pulse rounded-full" />
            <div className="w-24 h-4 bg-gray-600 animate-pulse rounded" />
          </div>
          <div className="w-20 h-8 bg-gray-600 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - User info */}
        <div className="flex items-center gap-3">
          <Avatar className={`w-10 h-10 border-2 ${colorScheme.avatarBorder} ${colorScheme.avatarBg}`}>
            <span className="text-lg font-semibold text-white">
              {getUserInitial()}
            </span>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {getUserDisplayName()}
            </span>
            <span className="text-xs text-gray-400">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Right side - Logout button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${colorScheme.primaryRing}`}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}