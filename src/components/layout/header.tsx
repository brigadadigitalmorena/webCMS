"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { formatRoleName } from "@/lib/utils";
import {
  LogOut,
  User,
  Bell,
  Menu,
  ChevronDown,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { SystemAlerts } from "./system-alerts";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";

interface HeaderProps {
  onMenuClick: () => void;
}

const POLL_INTERVAL_MS = 30_000;

export function Header({ onMenuClick }: HeaderProps) {
  const { user, handleLogout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { unreadCount, fetchUnreadCount, fetchNotifications } =
    useNotificationStore();

  // Lightweight poll every 30 s (only count, not full list)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Load full list only when the panel is opened
  const handleOpenAlerts = () => {
    const next = !showAlerts;
    setShowAlerts(next);
    if (next) fetchNotifications();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 transition-colors">
      {/* Left section: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right section: Alerts + Theme toggle + User menu */}
      <div className="flex items-center gap-2">
        {/* System Alerts */}
        <div className="relative">
          <button
            onClick={handleOpenAlerts}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center leading-tight">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <SystemAlerts
            isOpen={showAlerts}
            onClose={() => setShowAlerts(false)}
          />
        </div>

        {/* Theme toggle */}
        {mounted ? (
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={
              theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
            }
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        ) : (
          <div className="p-2 w-9 h-9" aria-hidden="true" />
        )}

        {/* Help */}
        <Link
          href="/dashboard/help"
          className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Ayuda"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700" />

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRoleName(user.rol)}
                </p>
              </div>
              <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                        {formatRoleName(user.rol)}
                      </span>
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/dashboard/settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
