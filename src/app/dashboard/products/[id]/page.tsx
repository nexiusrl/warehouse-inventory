"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Minus, Package, Tag, Layers, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Product, StockAdjustment } from "@/lib/types"

async function fetchProduct(id: string): Promise<{ product: Product }> {
  const res = await fetch(`/api/products/${id}`)
  if (!res.ok) throw new Error("Failed to fetch product")
  const data = await res.json()
  // Convert date strings to Date objects
  return {
    ...data,
    product: {
      ...data.product,
      createdAt: new Date(data.product.createdAt),
      updatedAt: new Date(data.product.updatedAt),
    }
  }
}

async function adjustStock(
  productId: string,
  type: "add" | "remove",
  quantity: number
): Promise<{ product: Product; adjustment: StockAdjustment }> {
  const res = await fetch(`/api/products/${productId}/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, type, quantity }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to adjust stock")
  }
  return res.json()
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const queryClient = useQueryClient()
  
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })

  const adjustMutation = useMutation({
    mutationFn: ({ type, quantity }: { type: "add" | "remove"; quantity: number }) =>
      adjustStock(productId, type, quantity),
    onSuccess: (data) => {
      // Update the individual product cache
      queryClient.setQueryData(["product", productId], { 
        product: {
          ...data.product,
          createdAt: new Date(data.product.createdAt),
          updatedAt: new Date(data.product.updatedAt),
        }
      })
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["metrics"] })
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] })
      setSuccessMessage(
        `Successfully ${data.adjustment.type === "add" ? "added" : "removed"} ${data.adjustment.quantity} units`
      )
      setAdjustmentQuantity(1)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    onError: (err) => {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    },
  })

  const handleAdjust = (type: "add" | "remove") => {
    if (adjustmentQuantity < 1) return
    adjustMutation.mutate({ type, quantity: adjustmentQuantity })
  }

  if (fetchError) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive">
          <p>Product not found</p>
          <Button variant="link" onClick={() => router.push("/dashboard/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const product = data.product

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground">
          {product.category} • SKU: {product.sku}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{product.quantity}</div>
            <p className="text-xs text-muted-foreground">units available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SKU</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
              {product.sku}
            </code>
            <p className="text-xs text-muted-foreground mt-1">Unique identifier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg">{product.category}</div>
            <p className="text-xs text-muted-foreground">Product category</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Adjustment */}
        <Card>
          <CardHeader>
            <CardTitle>Adjust Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-32"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAdjust("add")}
                disabled={adjustMutation.isPending || adjustmentQuantity < 1}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
              <Button
                onClick={() => handleAdjust("remove")}
                disabled={adjustMutation.isPending || adjustmentQuantity > product.quantity}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="mr-2 h-4 w-4" />
                Remove Stock
              </Button>
            </div>
            {adjustmentQuantity > product.quantity && (
              <p className="text-sm text-destructive">
                Cannot remove more than {product.quantity} units
              </p>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{product.description}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p className="mt-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {new Date(product.updatedAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Product ID</Label>
              <p className="mt-1 text-xs font-mono text-muted-foreground">
                {product.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
