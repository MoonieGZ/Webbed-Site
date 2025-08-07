import { useUser } from "@/hooks/login/use-user"

export function useSidebarData() {
  const { user, loading, error } = useUser()

  const userData = user
    ? {
        name: user.name,
        rank: user.rank || "",
        avatar: user.avatar || "",
      }
    : {
        name: "Guest",
        rank: "",
        avatar: "",
      }

  return {
    user: userData,
    loading,
  }
}
