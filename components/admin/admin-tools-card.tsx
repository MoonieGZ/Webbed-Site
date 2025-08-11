import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MotionEffect } from "@/components/animate-ui/effects/motion-effect"
import { useAdminTools } from "@/hooks/admin/use-admin-tools"

export function AdminToolsCard() {
  const { tools } = useAdminTools()
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>Admin Tools</CardTitle>
        <CardDescription>
          Navigate to administrative tools and panels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center justify-between rounded-lg border bg-background/40 p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <tool.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium leading-none">
                    {tool.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tool.description}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
              >
                Open
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
