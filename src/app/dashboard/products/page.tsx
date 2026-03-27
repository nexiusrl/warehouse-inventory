"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, Plus, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Product } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

async function fetchProducts(): Promise<{ products: Product[] }> {
  const res = await fetch("/api/products")
  if (!res.ok) throw new Error("Failed to fetch products")
  const data = await res.json()
  // Convert date strings to Date objects
  return {
    products: data.products.map((p: Product) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }))
  }
}

const columnHelper = createColumnHelper<Product>()

function createColumns(router: ReturnType<typeof useRouter>) {
  return [
    columnHelper.accessor("name", {
      header: "Product Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("sku", {
      header: "SKU",
      cell: (info) => (
        <code className="bg-muted px-2 py-1 rounded text-xs">
          {info.getValue()}
        </code>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      cell: (info) => {
        const quantity = info.getValue()
        let colorClass = "text-green-600 dark:text-green-400"
        if (quantity === 0) {
          colorClass = "text-red-600 dark:text-red-400"
        } else if (quantity <= 10) {
          colorClass = "text-yellow-600 dark:text-yellow-400"
        }
        return <span className={`font-medium ${colorClass}`}>{quantity}</span>
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: "Last Updated",
      cell: (info) => {
        const date = info.getValue()
        return new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/dashboard/products/${info.row.original.id}`)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ]
}

export default function ProductsPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })

  const products = data?.products || []

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [products])

  // Filter by category first
  const filteredByCategory = useMemo(() => {
    if (categoryFilter === "all") return products
    return products.filter((p) => p.category === categoryFilter)
  }, [products, categoryFilter])

  const columns = createColumns(router)
  const table = useReactTable({
    data: filteredByCategory,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory products
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Category: {categoryFilter === "all" ? "All" : categoryFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => setCategoryFilter(category)}
              >
                {category === "all" ? "All Categories" : category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/products/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getRowCount()
            )}{" "}
            of {table.getRowCount()} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
