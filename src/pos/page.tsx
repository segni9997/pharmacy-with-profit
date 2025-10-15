"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { POSSystem } from "@/components/pos-system"

export default function POSPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <POSSystem />
}
