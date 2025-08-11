import { FishSymbol, Users } from "lucide-react"
import { useFriendRealtime } from "@/hooks/account/use-friend-realtime"

export function useNavMain() {
  const { pendingCount } = useFriendRealtime()
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
      badgeCount: pendingCount,
    },
  ]

  return { navMain }
}
