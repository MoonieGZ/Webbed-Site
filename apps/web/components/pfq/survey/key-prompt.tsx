"use client"

import { Key, ExternalLink, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PFQApiService } from "@/services/pfq-api"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useState } from "react"

interface SurveyKeyPromptProps {
  apiKey: string
  setApiKey: (key: string) => void
  hasApiKeyFromProfile: boolean
  onApiKeyValidated?: () => void
}

export function SurveyKeyPrompt({
  apiKey,
  setApiKey,
  hasApiKeyFromProfile,
  onApiKeyValidated,
}: SurveyKeyPromptProps) {
  const [validating, setValidating] = useState(false)

  const validateAndSetApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key.", toastStyles.error)
      return
    }

    setValidating(true)
    try {
      const result = await PFQApiService.whoAmI(apiKey.trim())

      if (result.success) {
        toast.success("API key validated successfully!", toastStyles.success)
        // Trigger response fetch after validation
        if (onApiKeyValidated) {
          onApiKeyValidated()
        }
      } else {
        toast.error(result.error || "Invalid API key.", toastStyles.error)
      }
    } catch (error) {
      console.error("Error validating API key:", error)
      toast.error("Failed to validate API key.", toastStyles.error)
    } finally {
      setValidating(false)
    }
  }

  const openPFQApiKeyPage = () => {
    window.open(
      "https://pokefarm.com/farm#tab=5.7",
      "_blank",
      "noopener,noreferrer",
    )
  }

  if (hasApiKeyFromProfile && apiKey) {
    return null // Don't show prompt if API key is already loaded from profile
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          PokéFarm Q API Key Required
        </CardTitle>
        <CardDescription>
          Please enter your PokéFarm Q API key to participate in this survey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="survey-api-key">API Key</Label>
          <div className="flex rounded-md shadow-xs">
            <Input
              id="survey-api-key"
              type="password"
              placeholder="Enter your PokéFarm Q API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="-me-px rounded-e-none shadow-none focus-visible:z-1"
              disabled={validating}
            />
            <Button
              className="rounded-s-none"
              onClick={validateAndSetApiKey}
              disabled={validating || !apiKey.trim()}
            >
              {validating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={openPFQApiKeyPage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

