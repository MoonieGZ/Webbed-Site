import { FishSymbol, Users } from "lucide-react"
import { useFriendRealtime } from "@/hooks/account/use-friend-realtime"
import { useSidebarData } from "@/hooks/navigation/use-sidebar-data"

export function useNavMain() {
  const { pendingCount } = useFriendRealtime()
  const { user } = useSidebarData()
  const isAuthenticated = !!user && user.id !== null
  const navMain = [
    {
      title: "Fimsh 1",
      url: "#",
      icon: FishSymbol,
      isActive: true,
      items: [
        {
          title: "Fimsh 1.1",
          url: "#",
        },
        {
          title: "Fimsh 1.2",
          url: "#",
        },
        {
          title: "Fimsh 1.3",
          url: "#",
        },
      ],
    },
    {
      title: "Fimsh 2",
      url: "#",
      icon: FishSymbol,
      items: [
        {
          title: "Fimsh 2.1",
          url: "#",
        },
        {
          title: "Fimsh 2.2",
          url: "#",
        },
        {
          title: "Fimsh 2.3",
          url: "#",
        },
      ],
    },
    {
      title: "Friends",
      url: "/friends",
      icon: Users,
      badgeCount: isAuthenticated ? pendingCount : undefined,
      requiresAccount: true,
    },
  ]

  const filtered = navMain
    .filter((item) => !item.requiresAccount || isAuthenticated)
    .map((item) =>
      item.items
        ? {
            ...item,
            items: item.items.filter(
              // Support requiresAccount on subitems in the future
              // @ts-ignore optional property
              (sub) => !sub.requiresAccount || isAuthenticated,
            ),
          }
        : item,
    )

  return { navMain: filtered }
}
