"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Package, TrendingUp, AlertTriangle, PackageCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryMetrics, StockAdjustment } from "@/lib/types"

async function fetchMetrics(): Promise<{ metrics: InventoryMetrics }> {
  const res = await fetch("/api/metrics")
  if (!res.ok) throw new Error("Failed to fetch metrics")
  return res.json()
}

async function fetchRecentActivity(): Promise<{ adjustments: StockAdjustment[] }> {
  const res = await fetch("/api/activity?limit=5")
  if (!res.ok) throw new Error("Failed to fetch activity")
  const data = await res.json()
  // Convert date strings to Date objects
  return {
    adjustments: data.adjustments.map((a: StockAdjustment) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }))
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
  })

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  })

  const metrics = metricsData?.metrics
  const adjustments = activityData?.adjustments || []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : metrics?.totalSkus || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : metrics?.totalQuantity || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total units across all products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : metrics?.inStock || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Products with stock &gt; 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "..." : (metrics?.lowStock || 0) + (metrics?.outOfStock || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Products needing attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Stock Status Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Stock Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>In Stock (&gt;10)</span>
                </div>
                <span className="font-medium">
                  {metricsLoading ? "..." : metrics?.inStock || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span>Low Stock (1-10)</span>
                </div>
                <span className="font-medium">
                  {metricsLoading ? "..." : metrics?.lowStock || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span>Out of Stock</span>
                </div>
                <span className="font-medium">
                  {metricsLoading ? "..." : metrics?.outOfStock || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : adjustments.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {adjustments.map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          adjustment.type === "add"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-medium">
                        {adjustment.type === "add" ? "Added" : "Removed"}
                      </span>
                      <span className="text-muted-foreground">
                        {adjustment.quantity} units
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(adjustment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
