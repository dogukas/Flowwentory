"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  HomeIcon,
  Package,
  LayoutDashboard,
  ChevronLeft,
  TrendingUp,
  Users,
  BarChart,
  ClipboardList,
  Menu,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface MenuItem {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  isHeader?: boolean;
  badge?: number | string;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()

  // Simple dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
    },
    {
      title: "Stok Sorgula",
      icon: <Package size={20} />,
      href: "/stock",
      badge: 3,
      badgeVariant: "destructive"
    },
    {
      title: "Stok Sayım",
      icon: <ClipboardList size={20} />,
      href: "/stock-counting",
      badge: 2,
      badgeVariant: "secondary"
    },
    {
      title: "Operasyon",
      isHeader: true,
    },
    {
      title: "Ürün Planlama",
      icon: <ClipboardList size={20} />,
      href: "/operations/planning",
    },
    {
      title: "Satış Analiz",
      icon: <TrendingUp size={20} />,
      href: "/sales",
    },
    {
      title: "Personel Analiz",
      icon: <Users size={20} />,
      href: "/personnel-analysis",
    },
    {
      title: "Personel Ciro ve KPI",
      icon: <BarChart size={20} />,
      href: "/personnel-kpi",
    }
  ]

  return (
    <>
      {/* Hamburger Menu Button - Always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 h-10 w-10 rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5 text-slate-900 dark:text-white" />
      </Button>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -320, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed left-4 top-4 bottom-4 w-72 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md">
                  <Image
                    src="/icon.png"
                    alt="Flope"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  Flope
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                aria-label="Menüyü kapat"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item, index) => {
                if (item.isHeader) {
                  return (
                    <div
                      key={index}
                      className="px-3 py-2 mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    >
                      {item.title}
                    </div>
                  );
                }

                const isActive = item.href ? pathname === item.href : false;

                return (
                  <Link
                    key={item.href || index}
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "transition-all",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    )}>
                      {item.icon}
                    </div>

                    {/* Title */}
                    <span className="truncate text-sm flex-1">
                      {item.title}
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || "secondary"}
                        className="h-5 px-2 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
                <p className="font-medium">© 2026 Flope ERP</p>
                <p className="text-slate-400 dark:text-slate-500">v1.0.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

