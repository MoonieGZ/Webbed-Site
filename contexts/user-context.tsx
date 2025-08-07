"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

interface User {
  id: number
  email: string
  name: string
  rank?: string
  avatar?: string
  name_changed_at?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  updateUser: (updates: Partial<User>) => void
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
      setError("Failed to fetch user data")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        updateUser,
        refetch: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
