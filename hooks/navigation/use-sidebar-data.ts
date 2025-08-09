import { useUser } from "@/hooks/login/use-user"
import type { AppUser } from "@/types/user"

export function useSidebarData() {
  const { user, loading, error } = useUser()

  const userData: Pick<AppUser, "name" | "title" | "avatar"> = user
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
