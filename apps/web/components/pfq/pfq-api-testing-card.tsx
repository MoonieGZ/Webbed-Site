import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { usePFQApiKey } from "@/hooks/pfq/use-pfq-api-key"
import { usePFQApiTesting } from "@/hooks/pfq/use-pfq-api-testing"

export function PFQApiTestingCard() {
  const { apiKey, loading: apiKeyLoading, error: apiKeyError } = usePFQApiKey()
  const { testResults, isRunning, runAllTests, clearResults } =
    usePFQApiTesting(apiKey)

  if (apiKeyLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PFQ API Testing</CardTitle>
          <CardDescription>Testing all PFQ API functions</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (apiKeyError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PFQ API Testing</CardTitle>
          <CardDescription>Testing all PFQ API functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive mb-4">
            Error loading API key: {apiKeyError}
          </div>
          <Button disabled>Run Tests</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PFQ API Testing</CardTitle>
        <CardDescription>
          Testing all PFQ API functions with item ID 244 and search term "Jewel"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning || !apiKey}
            className="flex-1"
          >
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
          {testResults.length > 0 && (
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning}
            >
              Clear Results
            </Button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.functionName}</span>
                  <div className="flex items-center gap-2">
                    {result.loading && (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                    {!result.loading && (
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    )}
                  </div>
                </div>

                {result.error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    Error: {result.error}
                  </div>
                )}

                {result.success && result.data && (
                  <div className="text-sm">
                    <details className="cursor-pointer">
                      <summary className="font-medium">Response Data</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!apiKey && (
          <div className="text-center text-muted-foreground py-4">
            No PFQ API key found. Please add one in your account settings.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
