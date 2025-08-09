"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginForm } from "@/hooks/login/use-login-form"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    email,
    setEmail,
    isLoading,
    cooldownMessage,
    isCooldownActive,
    buttonLabel,
    handleSubmit,
  } = useLoginForm()

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="me@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isCooldownActive}
        >
          {isLoading ? "Sending..." : buttonLabel}
        </Button>
      </div>
      <div className="text-center text-sm">
        {cooldownMessage && (
          <>
            <span className="text-amber-600 dark:text-amber-400">
              {cooldownMessage}
            </span>
            <br />
            <br />
          </>
        )}
        We&apos;ll send you a magic link to sign in.
        <br />
        Don&apos;t have an account? We&apos;ll create one for you.
      </div>
    </form>
  )
}
