"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Usuarios",
  surveys: "Encuestas",
  assignments: "Asignaciones",
  reports: "Reportes",
  notifications: "Notificaciones",

  settings: "Configuración",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Parse pathname into breadcrumb items
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      label,
      href: index < segments.length - 1 ? href : undefined, // Last item is not clickable
    };
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="hidden sm:flex items-center space-x-1 text-sm min-w-0">
      {/* Home link */}
      <Link
        href="/dashboard"
        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Inicio"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.label} className="flex items-center min-w-0">
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium px-2 py-1 truncate">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
