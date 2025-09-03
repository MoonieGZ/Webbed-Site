"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarketboardItem } from "@/hooks/pfq/use-marketboard-item"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Landmark, SquareArrowOutUpRight } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

interface Props {
  itemId: number
}

export function PFQMarketboardItem({ itemId }: Props) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const intervalDays = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
  const { loading, error, trends, summary, item, refresh, hasApiKey } =
    useMarketboardItem(itemId, intervalDays)

  const priceData = trends.map((t) => ({
    day: t.day,
    min: t.min_price,
    avg: t.avg_price,
    max: t.max_price,
  }))
  const volumeData = trends.map((t) => ({
    day: t.day,
    sales: t.sales_count,
    quantity: t.total_quantity,
  }))

  const priceChartConfig: ChartConfig = {
    min: { label: "Min Price", color: "var(--chart-2)" },
    avg: { label: "Avg Price", color: "var(--chart-1)" },
    max: { label: "Max Price", color: "var(--chart-3)" },
  }

  const volumeChartConfig: ChartConfig = {
    quantity: { label: "Quantity", color: "var(--chart-4)" },
    sales: { label: "Sales", color: "var(--chart-5)" },
  }

  const copyURL = () => {
    const url = `${window.location.origin}/pfq/marketboard/${itemId}`
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard", toastStyles.success)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="flex items-center gap-2">
              {item?.sprite ? (
                <Image
                  src={item.sprite}
                  alt={item.name}
                  className="h-6 w-6"
                  width={24}
                  height={24}
                />
              ) : (
                <Landmark className="w-4 h-4" />
              )}
              {item?.name ?? `Item ${itemId}`}
            </CardTitle>
            <CardDescription>
              Marketboard trends for the selected range
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-2 flex items-center gap-2">
            <Button
              disabled
              variant="outline"
              size="sm"
              title="Discord alerts coming soon"
            >
              Add Alert (soon)
            </Button>
            <Button
              onClick={copyURL}
              size="sm"
              variant="outline"
              title="Share this item"
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasApiKey ? (
            <div className="text-sm text-muted-foreground">
              Add your PFQ API key to load item data.
            </div>
          ) : loading ? (
            <div className="space-y-3">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : (
            <div className="space-y-6">
              <ChartContainer
                config={priceChartConfig}
                className="aspect-auto h-[320px] w-full"
              >
                <LineChart data={priceData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value as string)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={true}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value as string).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )
                        }
                        indicator="dot"
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="var(--color-min)"
                    strokeWidth={2}
                    dot={false}
                    name="Min Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="var(--color-avg)"
                    strokeWidth={2}
                    dot={false}
                    name="Avg Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke="var(--color-max)"
                    strokeWidth={2}
                    dot={false}
                    name="Max Price"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>

              <ChartContainer
                config={volumeChartConfig}
                className="aspect-auto h-[320px] w-full"
              >
                <AreaChart data={volumeData} margin={{ left: 12, right: 12 }}>
                  <defs>
                    <linearGradient
                      id="fillQuantity"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-quantity)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-quantity)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-sales)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-sales)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value as string)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={true}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value as string).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )
                        }
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    type="natural"
                    dataKey="quantity"
                    fill="url(#fillQuantity)"
                    stroke="var(--color-quantity)"
                    stackId="a"
                    name="Quantity"
                  />
                  <Area
                    type="natural"
                    dataKey="sales"
                    fill="url(#fillSales)"
                    stroke="var(--color-sales)"
                    stackId="a"
                    name="Sales"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>

              {summary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Stat
                    label="Lowest Sale"
                    value={summary[0]?.lowest_price}
                    unit="Cr"
                  />
                  <Stat
                    label="Highest Sale"
                    value={summary[0]?.highest_price}
                    unit="Cr"
                  />
                  <Stat
                    label="Quantity Available"
                    value={summary[0]?.total_quantity}
                  />
                  <Stat
                    label="Active Listings"
                    value={summary[0]?.listings_count}
                  />
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string
  value: number | undefined
  unit?: string
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">
        {value !== undefined ? value.toLocaleString() : "-"} {unit ?? ""}
      </div>
    </div>
  )
}
