import { FishSymbol } from "lucide-react"

export function useNavMain() {
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
  ]

  return { navMain }
}
