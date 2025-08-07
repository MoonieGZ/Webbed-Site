import { Gamepad2, Webhook } from "lucide-react"

export function useNavLinks() {
  const links = [
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
  ]

  return { links }
}
