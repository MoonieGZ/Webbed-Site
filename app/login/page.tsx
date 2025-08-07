'use client';

import { Moon } from "lucide-react"
import { LoginForm } from "@/components/tools/login/login-form"
import { MotionEffect } from "@/components/animate-ui/effects/motion-effect"
import { useSession } from "@/hooks/login/use-session"

export default function LoginPage() {
  const { loading } = useSession();

  return (
    <div className="grid min-h-svh lg:grid-cols-2 relative">
      {loading && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      <div className={`flex flex-col gap-4 p-6 md:p-10 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Moon className="size-4" />
            </div>
            mnsy.dev
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <MotionEffect slide>
              <LoginForm />
            </MotionEffect>
          </div>
        </div>
      </div>
      <div className={`bg-muted relative hidden lg:block transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src="/login/bg.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-50"
        />
      </div>
    </div>
  )
}
