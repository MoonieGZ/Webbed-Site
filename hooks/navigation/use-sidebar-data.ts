import {
  Moon,
  Send,
  Settings2,
  Gamepad2,
  Webhook,
  MessageCircleHeart,
  FishSymbol,
} from "lucide-react"
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

  const data = {
    user: userData,
    navMain: [
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
        title: "Fimsh 3",
        url: "#",
        icon: FishSymbol,
        items: [
          {
            title: "Fimsh 3.1",
            url: "#",
          },
          {
            title: "Fimsh 3.2",
            url: "#",
          },
          {
            title: "Fimsh 3.3",
            url: "#",
          },
          {
            title: "Fimsh 3.4",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
      {
        title: "Bluesky",
        url: "https://bsky.app/profile/mnsy.dev",
        icon: MessageCircleHeart,
      },
    ],
    links: [
      {
        name: "PokéFarm Q",
        url: "https://pokefarm.com/",
        icon: Gamepad2,
      },
      {
        name: "PokéFarm Q API",
        url: "https://api.pokefarm.com/docs/",
        icon: Webhook,
      },
    ],
  }

  return {
    ...data,
    loading,
  }
}
