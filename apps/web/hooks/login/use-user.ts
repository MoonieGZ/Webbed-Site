import { useUserContext } from "@/contexts/user-context"

export function useUser() {
  const { user, loading, error, refetch } = useUserContext()

  return {
    user,
    loading,
    error,
    refetch,
  }
}
