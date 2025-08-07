import { Send, MessageCircleHeart } from "lucide-react"

export function useNavSecondary() {
  const navSecondary = [
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
  ]

  return { navSecondary }
}
