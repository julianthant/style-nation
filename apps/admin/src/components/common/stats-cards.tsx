import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  footer?: {
    label: string
    description: string
  }
}

function StatsCard({ title, value, description, trend, footer }: StatsCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              {trend.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
              {trend.value}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footer.label} {trend?.isPositive ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {footer.description}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

interface StatsCardsProps {
  stats: {
    totalRevenue: number
    newCustomers: number
    activeAccounts: number
    growthRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
        trend={{ value: "+12.5%", isPositive: true }}
        footer={{
          label: "Trending up this month",
          description: "Revenue from car sales"
        }}
      />
      
      <StatsCard
        title="Total Cars"
        value={stats.newCustomers}
        trend={{ value: "+8.2%", isPositive: true }}
        footer={{
          label: "New inventory added",
          description: "Active listings this month"
        }}
      />
      
      <StatsCard
        title="Cars Sold"
        value={stats.activeAccounts}
        trend={{ value: "+12.5%", isPositive: true }}
        footer={{
          label: "Strong sales performance",
          description: "Conversions exceed targets"
        }}
      />
      
      <StatsCard
        title="Inquiry Rate"
        value={`${stats.growthRate}%`}
        trend={{ value: "+4.5%", isPositive: true }}
        footer={{
          label: "Steady performance increase",
          description: "Customer engagement up"
        }}
      />
    </div>
  )
}