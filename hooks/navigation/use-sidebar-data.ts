import { useUser } from "@/hooks/login/use-user"

export function useSidebarData() {
  const { user, loading, error } = useUser()

  const userData: { name: string; title: string; avatar: string } = user
    ? {
        name: user.name,
        title: user.title || "",
        avatar: user.avatar || "",
      }
    : {
        name: "Guest",
        title: "",
        avatar: "",
      }

  return {
    user: userData,
    loading,
  }
}
