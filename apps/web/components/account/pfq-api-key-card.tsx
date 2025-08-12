"use client"

import { Key, ExternalLink, Trash2, Save } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { usePFQApiKey } from "@/hooks/account/use-pfq-api-key"

export function PFQApiKeyCard() {
  const {
    apiKeyInfo,
    loading,
    isSaving,
    isDeleting,
    apiKey,
    setApiKey,
    saveApiKey,
    deleteApiKey,
    openPFQApiKeyPage,
  } = usePFQApiKey()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            PokéFarm Q API Key
          </CardTitle>
          <CardDescription>
            Connect your PokéFarm Q account to enable the PFQ pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          PokéFarm Q API Key
        </CardTitle>
        <CardDescription>
          Connect your PFQ account to enable the PFQ pages and functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeyInfo?.hasApiKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium px-2">
                  API Key Connected on{" "}
                  <strong>
                    {apiKeyInfo.created_at
                      ? new Date(apiKeyInfo.created_at).toLocaleDateString()
                      : "Unknown"}
                  </strong>{" "}
                  <br />
                  Last validated on{" "}
                  <strong>
                    {apiKeyInfo.last_validated
                      ? new Date(apiKeyInfo.last_validated).toLocaleDateString()
                      : "Unknown"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 right-0 z-10">
                <Button
                  onClick={deleteApiKey}
                  variant="outline"
                  size="sm"
                  className="hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2 pr-20">
                <CardTitle className="flex items-center gap-2">
                  Connection Details
                </CardTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                  {apiKeyInfo.pfqUser ? (
                    <>
                      <p>
                        <strong>Name:</strong> {apiKeyInfo.pfqUser.displayname}
                      </p>
                      <p>
                        <strong>Profile:</strong>{" "}
                        <a
                          href={`https://pfq.link/@${apiKeyInfo.pfqUser.shortlink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {apiKeyInfo.pfqUser.shortlink}{" "}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </p>
                    </>
                  ) : (
                    <p className="text-amber-600 dark:text-amber-400">
                      Unable to fetch PFQ user information
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="font-medium">No API Key Connected</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pfq-api-key">API Key</Label>
              <div className="flex rounded-md shadow-xs">
                <Input
                  id="pfq-api-key"
                  type="password"
                  placeholder="Enter your PokéFarm Q API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="-me-px rounded-e-none shadow-none focus-visible:z-1"
                  disabled={isSaving}
                />
                <Button
                  className="rounded-s-none"
                  onClick={saveApiKey}
                  disabled={isSaving || !apiKey.trim()}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
