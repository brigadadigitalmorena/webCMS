import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
  /** Optional trend indicator: positive = green up, negative = red down */
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  trend,
}: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && trend !== "neutral" && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 leading-none">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}
