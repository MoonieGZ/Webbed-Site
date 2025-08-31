import {
  Users,
  Shield,
  Wrench,
  Database,
  BadgeCheck,
  MessageSquare,
} from "lucide-react"

type AdminTool = {
  title: string
  description: string
  href: string
  icon: any
}

export function useAdminTools() {
  const tools: AdminTool[] = [
    {
      title: "Users",
      description: "View and manage all users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Badges",
      description: "Review and assign badges",
      href: "/admin/badges",
      icon: BadgeCheck,
    },
    {
      title: "WW Groupings",
      description: "Assign material groups to WW characters",
      href: "/admin/wuwa/groups",
      icon: Shield,
    },
    {
      title: "System",
      description: "Maintenance & tools",
      href: "/admin/tools",
      icon: Wrench,
    },
    {
      title: "Database",
      description: "Data inspection (read-only)",
      href: "/admin/database",
      icon: Database,
    },
  ]

  return { tools }
}
