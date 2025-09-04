"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { usePFQIVs } from "@/hooks/pfq/use-pfq-ivs"
import { ChevronLeft, ChevronRight, ChartLine } from "lucide-react"

export function PFQIVTable() {
  const {
    ivs,
    loading,
    error,
    nicknames,
    setNickname,
    filterIVCount,
    setFilterIVCount,
    page,
    nextPage,
    prevPage,
    totalPages,
  } = usePFQIVs()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5" />
          PokéFarm Q IVs
        </CardTitle>
        <CardDescription>
          Names/species are not available due to current API limitations. You
          can set a nickname for each Pokémon. This will persist in your
          browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm text-muted-foreground">Filter:</div>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Button
                  key={n}
                  variant={filterIVCount === n ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterIVCount(filterIVCount === n ? null : n)
                  }
                >
                  {n}IV
                </Button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
                  onClick={prevPage}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-sm tabular-nums">
                  Page {page} / {totalPages}
                </div>
                <button
                  disabled={page >= totalPages}
                  className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
                  onClick={nextPage}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">IVs</th>
                    <th className="py-2 pr-3">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {ivs.map((entry) => {
                    const name = nicknames[entry.shortlink] || ""
                    const ivString = Array.isArray(entry.iv)
                      ? entry.iv.join(",")
                      : ""
                    return (
                      <tr
                        key={entry.shortlink}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 pr-3 w-[260px]">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Nickname"
                              value={name}
                              onChange={(e) =>
                                setNickname(entry.shortlink, e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="py-2 pr-3 font-mono">{ivString}</td>
                        <td className="py-2 pr-3">
                          <Button variant="outline">
                            <Link
                              href={`https://pokefarm.com/summary/${entry.shortlink}`}
                              target="_blank"
                            >
                              Open
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {ivs.length === 0 && (
                    <tr>
                      <td
                        className="py-6 text-center text-muted-foreground"
                        colSpan={3}
                      >
                        No entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
