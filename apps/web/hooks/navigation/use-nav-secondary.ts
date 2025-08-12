import { MessageCircleHeart, MessageCircleQuestionMark } from "lucide-react"

export function useNavSecondary() {
  const navSecondary = [
    {
      title: "Bluesky",
      url: "https://bsky.app/profile/mnsy.dev",
      icon: MessageCircleHeart,
    },
    {
      title: "Support",
      url: "/support",
      icon: MessageCircleQuestionMark,
    },
  ]

  return { navSecondary }
}
