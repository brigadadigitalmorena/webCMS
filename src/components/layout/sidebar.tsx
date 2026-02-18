"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  KeyRound,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /**
   * Roles allowed to see this navigation item
   * If not specified, all authenticated users can see it
   */
  allowedRoles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["admin", "encargado"], // Admins and supervisors
      },
      {
        href: "/dashboard/surveys",
        label: "Encuestas",
        icon: FileText,
        allowedRoles: ["admin", "encargado"],
      },
      {
        href: "/dashboard/assignments",
        label: "Asignaciones",
        icon: ClipboardList,
        allowedRoles: ["admin", "encargado"],
      },
    ],
  },
  {
    title: "Usuarios",
    items: [
      {
        href: "/dashboard/users",
        label: "Usuarios",
        icon: Users,
        allowedRoles: ["admin"], // Admin only
      },
      {
        href: "/dashboard/whitelist",
        label: "Invitaciones",
        icon: UserCheck,
        allowedRoles: ["admin"], // Admin only
      },
    ],
  },
  {
    title: "Análisis",
    items: [
      {
        href: "/dashboard/reports",
        label: "Reportes",
        icon: BarChart3,
        allowedRoles: ["admin", "encargado"],
      },
    ],
  },
  {
    title: "Utilidades",
    items: [
      {
        href: "/dashboard/system-health",
        label: "Estado del Sistema",
        icon: Activity,
        allowedRoles: ["admin"],
      },
      {
        href: "/dashboard/settings",
        label: "Configuración",
        icon: Settings,
        allowedRoles: ["admin"], // Admin only
      },
      {
        href: "/dashboard/help",
        label: "Ayuda",
        icon: HelpCircle,
        allowedRoles: ["admin", "encargado", "brigadista"],
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  isOpen,
  setIsOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { role } = useRole();

  /**
   * Filter navigation items based on user role
   */
  const filterByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      // If no roles specified, show to all authenticated users
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        return true;
      }
      // Check if user's role is in allowed roles
      return role ? item.allowedRoles.includes(role) : false;
    });
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
            {!isDesktopCollapsed && (
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-opacity duration-200">
                Brigada CMS
              </h1>
            )}
            {isDesktopCollapsed && (
              <div className="w-8 h-8 rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            )}
            {/* Desktop collapse button */}
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="hidden lg:flex items-center justify-center p-2 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 dark:hover:from-primary-900/30 dark:hover:to-blue-900/30 rounded-lg transition-all duration-200 hover:shadow-sm"
              title={isDesktopCollapsed ? "Expandir" : "Contraer"}
            >
              {isDesktopCollapsed ? (
                <ChevronRight className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform duration-200" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform duration-200" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div
              className={cn("space-y-6", isDesktopCollapsed ? "px-2" : "px-3")}
            >
              {navSections.map((section) => {
                // Filter items by user role
                const filteredItems = filterByRole(section.items);

                // Don't render section if no items are visible
                if (filteredItems.length === 0) return null;

                return (
                  <div key={section.title}>
                    {!isDesktopCollapsed && (
                      <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    )}
                    <ul className="space-y-1">
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                                isDesktopCollapsed && "justify-center px-2",
                              )}
                              title={
                                isDesktopCollapsed ? item.label : undefined
                              }
                            >
                              <Icon
                                className={cn(
                                  "w-5 h-5 flex-shrink-0",
                                  isActive &&
                                    "text-primary-600 dark:text-primary-400",
                                )}
                              />
                              {!isDesktopCollapsed && (
                                <span className="flex-1">{item.label}</span>
                              )}
                              {!isDesktopCollapsed && item.badge && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                              {/* Tooltip for collapsed state */}
                              {isDesktopCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                  {item.label}
                                </div>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!isDesktopCollapsed && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  © 2026 Brigada CMS
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  v1.0.0
                </p>
              </div>
            )}
            {isDesktopCollapsed && (
              <div className="flex justify-center">
                <div
                  className="w-2 h-2 rounded-full bg-green-500"
                  title="Sistema operativo"
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
