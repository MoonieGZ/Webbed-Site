"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useMarketboardSearch } from "@/hooks/pfq/use-marketboard-search"
import { Landmark } from "lucide-react"
import Image from "next/image"

export function PFQMarketboardSearch() {
  const { query, setQuery, results, loading, error, hasApiKey } =
    useMarketboardSearch(500)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          Search Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder={
              hasApiKey
                ? "Search items by name..."
                : "Add your PFQ API key to search"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!hasApiKey}
          />

          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : null}

          {!loading && results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/pfq/marketboard/${item.id}`}
                  className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent"
                >
                  {item.sprite ? (
                    <Image
                      src={item.sprite}
                      alt={item.name}
                      className="h-6 w-6"
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.category}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              ))}
            </div>
          ) : null}

          {!loading &&
          hasApiKey &&
          query.trim().length >= 2 &&
          results.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No results found.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
