"use client"

import { Suspense } from "react"
import { Moon, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMagicLink } from "@/hooks/login/use-magic-link"
import Link from "next/link"
import Image from "next/image"

function MagicLinkPageContent() {
  const { status, message, handleBackToLogin } = useMagicLink()

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "error":
      case "invalid":
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500"
      case "error":
      case "invalid":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Moon className="size-4" />
            </div>
            mnsy.dev
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
              {status === "loading" && "Validating..."}
              {status === "success" && "Success!"}
              {status === "error" && "Error"}
              {status === "invalid" && "Invalid Token"}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">{message}</p>
            {(status === "error" || status === "invalid") && (
              <Button onClick={handleBackToLogin} className="w-full">
                Back to Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/login/bg.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-50"
          width={1000}
          height={1000}
        />
      </div>
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center">
          <div className="text-sm text-muted-foreground">
            Validating magic link…
          </div>
        </div>
      }
    >
      <MagicLinkPageContent />
    </Suspense>
  )
}
