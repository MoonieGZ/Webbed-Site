import {
  MessageCircleHeart,
  MessageCircleQuestionMark,
  MessageCircleWarning,
} from "lucide-react"

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
    {
      title: "Privacy Policy",
      url: "/privacy",
      icon: MessageCircleWarning,
    },
  ]

  return { navSecondary }
}
