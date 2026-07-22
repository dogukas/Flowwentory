"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Truck,
  TrendingUp,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface MenuItem {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  isHeader?: boolean;
  description?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
      icon: <LayoutDashboard size={18} />,
      href: "/dashboard",
      description: "Genel bakış",
    },
    {
      title: "Envanter",
      isHeader: true,
    },
    {
      title: "Stok Sorgula",
      icon: <Package size={18} />,
      href: "/stock",
      description: "Stok veri yönetimi",
    },
    {
      title: "Stok Sayım",
      icon: <ClipboardCheck size={18} />,
      href: "/stock-counting",
      description: "Sayım işlemleri",
    },
    {
      title: "Veri Ölçekleme",
      icon: <BarChart3 size={18} />,
      href: "/personnel-kpi",
      description: "Kırılım analizleri",
    },
    {
      title: "Operasyonlar",
      isHeader: true,
    },
    {
      title: "Planlama",
      icon: <Truck size={18} />,
      href: "/operations/planning",
      description: "Sipariş planlama",
    },
    {
      title: "Satışlar",
      icon: <TrendingUp size={18} />,
      href: "/sales",
      description: "Satış verileri",
    },
    {
      title: "Analiz",
      isHeader: true,
    },
    {
      title: "Personel Analiz",
      icon: <Users size={18} />,
      href: "/personnel-analysis",
      description: "Personel performansı",
    },
  ]

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 transition-all duration-200"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={cn(
              "fixed left-3 top-3 bottom-3 w-[280px] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-200/80 dark:border-slate-800 overflow-hidden",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Image
                      src="/logo-flow.png?v=3"
                      alt="Flowventory"
                      width={22}
                      height={22}
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[15px] text-slate-900 dark:text-white tracking-tight">
                    Flowventory
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">Envanter Yönetimi</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Menüyü kapat"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
              {menuItems.map((item, index) => {
                if (item.isHeader) {
                  return (
                    <div
                      key={index}
                      className="px-3 pt-5 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]"
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
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 text-blue-700 dark:text-blue-300"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}>
                      {item.icon}
                    </div>

                    {/* Title + Description */}
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "block text-sm truncate",
                        isActive ? "font-semibold" : "font-medium"
                      )}>
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate -mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 p-3">
              {/* Dark mode + Language + Logout row */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    title={isDarkMode ? "Açık Tema" : "Koyu Tema"}
                  >
                    {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                  </Button>
                  <LanguageSwitcher />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 gap-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 rounded-lg transition-colors px-2.5"
                  title="Çıkış Yap"
                >
                  <LogOut size={14} />
                  <span>Çıkış</span>
                </Button>
              </div>
              <div className="px-2 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">© 2026 Flowventory · v2.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
