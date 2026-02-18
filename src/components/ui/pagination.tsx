import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemCount?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemCount = true,
}: PaginationProps) {
  const pages = generatePaginationPages(currentPage, totalPages);

  const startItem =
    totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem =
    totalItems && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Item count */}
      {showItemCount && totalItems && startItem && endItem && (
        <div className="flex-1 hidden sm:block">
          <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Mostrando <span className="font-medium">{startItem}</span> a{" "}
            <span className="font-medium">{endItem}</span> de{" "}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </PaginationButton>

        {/* Previous page */}
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-1 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500"
              >
                ...
              </span>
            ) : (
              <PaginationButton
                key={page}
                onClick={() => onPageChange(page as number)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationButton>
            ),
          )}
        </div>

        {/* Mobile current page indicator */}
        <div className="sm:hidden px-3 py-1 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500">
          {currentPage} / {totalPages}
        </div>

        {/* Next page */}
        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>

        {/* Last page */}
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </PaginationButton>
      </div>
    </div>
  );
}

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  "aria-label"?: string;
}

function PaginationButton({
  children,
  onClick,
  disabled = false,
  isActive = false,
  "aria-label": ariaLabel,
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "px-3 py-1 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary-600 text-white"
          : "text-gray-700 dark:text-gray-300 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:bg-gray-800",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

// Helper function to generate page numbers with ellipsis
function generatePaginationPages(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pages: (number | string)[] = [];
  const showPages = 5; // Number of pages to show
  const sidePages = Math.floor(showPages / 2);

  if (totalPages <= showPages + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    // Calculate range
    let start = Math.max(2, currentPage - sidePages);
    let end = Math.min(totalPages - 1, currentPage + sidePages);

    // Adjust range if at the beginning or end
    if (currentPage <= sidePages + 1) {
      end = showPages;
    } else if (currentPage >= totalPages - sidePages) {
      start = totalPages - showPages + 1;
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
}
