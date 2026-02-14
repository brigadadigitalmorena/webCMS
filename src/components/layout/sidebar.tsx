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
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
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
      },
      {
        href: "/dashboard/surveys",
        label: "Encuestas",
        icon: FileText,
      },
      {
        href: "/dashboard/users",
        label: "Usuarios",
        icon: Users,
      },
      {
        href: "/dashboard/assignments",
        label: "Asignaciones",
        icon: ClipboardList,
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
      },
      {
        href: "/dashboard/system-health",
        label: "Estado del Sistema",
        icon: Activity,
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

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
            {!isDesktopCollapsed && (
              <h1 className="text-xl font-bold text-primary-600 transition-opacity duration-200">
                Brigada CMS
              </h1>
            )}
            {isDesktopCollapsed && (
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            )}
            {/* Desktop collapse button */}
            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="hidden lg:block p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isDesktopCollapsed ? "Expandir" : "Contraer"}
            >
              {isDesktopCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className={cn("space-y-6", isDesktopCollapsed ? "px-2" : "px-3")}>
              {navSections.map((section) => (
                <div key={section.title}>
                  {!isDesktopCollapsed && (
                    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {section.items.map((item) => {
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
                                ? "bg-primary-50 text-primary-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                              isDesktopCollapsed && "justify-center px-2",
                            )}
                            title={isDesktopCollapsed ? item.label : undefined}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive && "text-primary-600",
                              )}
                            />
                            {!isDesktopCollapsed && (
                              <span className="flex-1">{item.label}</span>
                            )}
                            {!isDesktopCollapsed && item.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            {/* Tooltip for collapsed state */}
                            {isDesktopCollapsed && (
                              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                {item.label}
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isDesktopCollapsed && (
              <div className="text-center">
                <p className="text-xs text-gray-500">© 2026 Brigada CMS</p>
                <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
              </div>
            )}
            {isDesktopCollapsed && (
              <div className="flex justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" title="Sistema operativo" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
