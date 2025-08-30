"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

// Sample data - you can replace this with real data from your API
const chartData = [
  { date: "2024-04-01", cars: 222, inquiries: 150 },
  { date: "2024-04-02", cars: 97, inquiries: 180 },
  { date: "2024-04-03", cars: 167, inquiries: 120 },
  { date: "2024-04-04", cars: 242, inquiries: 260 },
  { date: "2024-04-05", cars: 373, inquiries: 290 },
  { date: "2024-04-06", cars: 301, inquiries: 340 },
  { date: "2024-04-07", cars: 245, inquiries: 180 },
  { date: "2024-04-08", cars: 409, inquiries: 320 },
  { date: "2024-04-09", cars: 59, inquiries: 110 },
  { date: "2024-04-10", cars: 261, inquiries: 190 },
  { date: "2024-04-11", cars: 327, inquiries: 350 },
  { date: "2024-04-12", cars: 292, inquiries: 210 },
  { date: "2024-04-13", cars: 342, inquiries: 380 },
  { date: "2024-04-14", cars: 137, inquiries: 220 },
  { date: "2024-04-15", cars: 120, inquiries: 170 },
  { date: "2024-04-16", cars: 138, inquiries: 190 },
  { date: "2024-04-17", cars: 446, inquiries: 360 },
  { date: "2024-04-18", cars: 364, inquiries: 410 },
  { date: "2024-04-19", cars: 243, inquiries: 180 },
  { date: "2024-04-20", cars: 89, inquiries: 150 },
  { date: "2024-04-21", cars: 137, inquiries: 200 },
  { date: "2024-04-22", cars: 224, inquiries: 170 },
  { date: "2024-04-23", cars: 138, inquiries: 230 },
  { date: "2024-04-24", cars: 387, inquiries: 290 },
  { date: "2024-04-25", cars: 215, inquiries: 250 },
  { date: "2024-04-26", cars: 75, inquiries: 130 },
  { date: "2024-04-27", cars: 383, inquiries: 420 },
  { date: "2024-04-28", cars: 122, inquiries: 180 },
  { date: "2024-04-29", cars: 315, inquiries: 240 },
  { date: "2024-04-30", cars: 454, inquiries: 380 },
  { date: "2024-05-01", cars: 165, inquiries: 220 },
  { date: "2024-05-02", cars: 293, inquiries: 310 },
  { date: "2024-05-03", cars: 247, inquiries: 190 },
  { date: "2024-05-04", cars: 385, inquiries: 420 },
  { date: "2024-05-05", cars: 481, inquiries: 390 },
  { date: "2024-05-06", cars: 498, inquiries: 520 },
  { date: "2024-05-07", cars: 388, inquiries: 300 },
  { date: "2024-05-08", cars: 149, inquiries: 210 },
  { date: "2024-05-09", cars: 227, inquiries: 180 },
  { date: "2024-05-10", cars: 293, inquiries: 330 },
  { date: "2024-05-11", cars: 335, inquiries: 270 },
  { date: "2024-05-12", cars: 197, inquiries: 240 },
  { date: "2024-05-13", cars: 197, inquiries: 160 },
  { date: "2024-05-14", cars: 448, inquiries: 490 },
  { date: "2024-05-15", cars: 473, inquiries: 380 },
  { date: "2024-05-16", cars: 338, inquiries: 400 },
  { date: "2024-05-17", cars: 499, inquiries: 420 },
  { date: "2024-05-18", cars: 315, inquiries: 350 },
  { date: "2024-05-19", cars: 235, inquiries: 180 },
  { date: "2024-05-20", cars: 177, inquiries: 230 },
  { date: "2024-05-21", cars: 82, inquiries: 140 },
  { date: "2024-05-22", cars: 81, inquiries: 120 },
  { date: "2024-05-23", cars: 252, inquiries: 290 },
  { date: "2024-05-24", cars: 294, inquiries: 220 },
  { date: "2024-05-25", cars: 201, inquiries: 250 },
  { date: "2024-05-26", cars: 213, inquiries: 170 },
  { date: "2024-05-27", cars: 420, inquiries: 460 },
  { date: "2024-05-28", cars: 233, inquiries: 190 },
  { date: "2024-05-29", cars: 78, inquiries: 130 },
  { date: "2024-05-30", cars: 340, inquiries: 280 },
  { date: "2024-05-31", cars: 178, inquiries: 230 },
  { date: "2024-06-01", cars: 178, inquiries: 200 },
  { date: "2024-06-02", cars: 470, inquiries: 410 },
  { date: "2024-06-03", cars: 103, inquiries: 160 },
  { date: "2024-06-04", cars: 439, inquiries: 380 },
  { date: "2024-06-05", cars: 88, inquiries: 140 },
  { date: "2024-06-06", cars: 294, inquiries: 250 },
  { date: "2024-06-07", cars: 323, inquiries: 370 },
  { date: "2024-06-08", cars: 385, inquiries: 320 },
  { date: "2024-06-09", cars: 438, inquiries: 480 },
  { date: "2024-06-10", cars: 155, inquiries: 200 },
  { date: "2024-06-11", cars: 92, inquiries: 150 },
  { date: "2024-06-12", cars: 492, inquiries: 420 },
  { date: "2024-06-13", cars: 81, inquiries: 130 },
  { date: "2024-06-14", cars: 426, inquiries: 380 },
  { date: "2024-06-15", cars: 307, inquiries: 350 },
  { date: "2024-06-16", cars: 371, inquiries: 310 },
  { date: "2024-06-17", cars: 475, inquiries: 520 },
  { date: "2024-06-18", cars: 107, inquiries: 170 },
  { date: "2024-06-19", cars: 341, inquiries: 290 },
  { date: "2024-06-20", cars: 408, inquiries: 450 },
  { date: "2024-06-21", cars: 169, inquiries: 210 },
  { date: "2024-06-22", cars: 317, inquiries: 270 },
  { date: "2024-06-23", cars: 480, inquiries: 530 },
  { date: "2024-06-24", cars: 132, inquiries: 180 },
  { date: "2024-06-25", cars: 141, inquiries: 190 },
  { date: "2024-06-26", cars: 434, inquiries: 380 },
  { date: "2024-06-27", cars: 448, inquiries: 490 },
  { date: "2024-06-28", cars: 149, inquiries: 200 },
  { date: "2024-06-29", cars: 103, inquiries: 160 },
  { date: "2024-06-30", cars: 446, inquiries: 400 },
]

const chartConfig = {
  visitors: {
    label: "Activity",
  },
  cars: {
    label: "Car Views",
    color: "var(--primary)",
  },
  inquiries: {
    label: "Inquiries",
    color: "hsl(var(--primary) / 0.7)",
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  title?: string
  description?: string
  data?: typeof chartData
  config?: ChartConfig
}

export function ChartAreaInteractive({ 
  title = "Activity Overview",
  description = "Car views and inquiries over time",
  data = chartData,
  config = chartConfig 
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {description}
          </span>
          <span className="@[540px]/card:hidden">{title}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCars" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cars)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cars)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInquiries" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-inquiries)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-inquiries)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="inquiries"
              type="natural"
              fill="url(#fillInquiries)"
              stroke="var(--color-inquiries)"
              stackId="a"
            />
            <Area
              dataKey="cars"
              type="natural"
              fill="url(#fillCars)"
              stroke="var(--color-cars)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}