"use client"

import { useQuery } from "@tanstack/react-query"
import { History, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockAdjustment } from "@/lib/types"

async function fetchAllActivity(): Promise<{ adjustments: StockAdjustment[] }> {
  const res = await fetch("/api/activity")
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

export default function ActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["all-activity"],
    queryFn: fetchAllActivity,
  })

  const adjustments = data?.adjustments || []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Complete history of all stock adjustments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading...
            </div>
          ) : adjustments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {adjustments.map((adjustment) => (
                <div
                  key={adjustment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        adjustment.type === "add"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {adjustment.type === "add" ? (
                        <ArrowUpCircle className="h-5 w-5" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        <span
                          className={
                            adjustment.type === "add"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {adjustment.type === "add" ? "Added" : "Removed"}
                        </span>{" "}
                        {adjustment.quantity} units
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Previous: {adjustment.previousQuantity} → New:{" "}
                        {adjustment.newQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>
                      {new Date(adjustment.timestamp).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      {new Date(adjustment.timestamp).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
