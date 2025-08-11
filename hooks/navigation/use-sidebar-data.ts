import type { AppUser } from "@/types/user"
import { useUser } from "@/hooks/login/use-user"

export function useSidebarData() {
  const { user, loading, error } = useUser()

  type SidebarUser = {
    id: number | null
    name: string
    title: string
    avatar: string
  }

  const raw = (user as AppUser | null) || null
  const userData: SidebarUser = raw
    ? {
        id: raw.id ?? null,
        name: raw.name,
        title: raw.title || "",
        avatar: raw.avatar || "",
      }
    : {
        id: null,
        name: "Guest",
        title: "",
        avatar: "",
      }

  return {
    user: userData,
    loading,
  }
}
