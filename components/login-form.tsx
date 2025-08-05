import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your PFQ account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your PFQ API key below
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="api-key">API Key</Label>
          <Input id="api-key" type="text" placeholder="1234567890abcdef" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an API key?{" "}
        <a href="https://pokefarm.com/farm#tab=5.7" className="underline underline-offset-4">
          Get one here.
        </a>
      </div>
    </form>
  )
}
