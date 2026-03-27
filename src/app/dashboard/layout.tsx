"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Package, LayoutDashboard, Box, History, LogOut, PlusCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useQueryClient } from "@tanstack/react-query"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Box,
  },
  {
    title: "Activity",
    href: "/dashboard/activity",
    icon: History,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    // Clear all React Query cache
    queryClient.clear()
    // Sign out and redirect to login
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Package className="h-6 w-6" />
            <span className="font-semibold">Warehouse</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4 space-y-4">
            <Link
              href="/dashboard/products/new"
              className="flex items-center justify-center gap-2 w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
              Add Product
            </Link>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground truncate">
                {session.user?.email}
              </div>
              <ThemeToggle />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
