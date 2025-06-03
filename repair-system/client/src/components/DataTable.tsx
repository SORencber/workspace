import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Column<T> = {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  actionColumn?: (item: T) => React.ReactNode;
  pagination?: {
    pageSize: number;
    totalItems: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortKey: keyof T | null;
    sortDirection: "asc" | "desc";
    onSortChange: (key: keyof T, direction: "asc" | "desc") => void;
  };
  filtering?: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onFilterApply?: (filters: Record<string, string>) => void;
  };
};

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder,
  actionColumn,
  pagination,
  sorting,
  filtering,
}: DataTableProps<T>) => {
  const { t } = useTranslation();
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSort = (key: keyof T) => {
    if (!sorting) return;

    const direction =
      sorting.sortKey === key && sorting.sortDirection === "asc" ? "desc" : "asc";
    sorting.onSortChange(key, direction);
  };

  const handleFilterChange = (key: keyof T, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) {
      delete newFilters[key as string];
    }
    setActiveFilters(newFilters);

    if (filtering?.onFilterApply) {
      filtering.onFilterApply(newFilters);
    }
  };

  const pageCount = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 0;

  return (
    <div className="space-y-4">
      {filtering && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder || t("common.search")}
              className="pl-8 w-full"
              value={filtering.searchTerm}
              onChange={(e) => filtering.onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {columns.some(col => col.filterable) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t("common.filters")}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {columns.filter(col => col.filterable).map((column) => (
                    <div key={column.key as string} className="p-2">
                      <div className="font-medium mb-1">{column.title}</div>
                      <Input
                        placeholder={t("common.filterBy", { field: column.title })}
                        value={activeFilters[column.key as string] || ""}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {pagination && (
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 {t("common.perPage")}</SelectItem>
                  <SelectItem value="25">25 {t("common.perPage")}</SelectItem>
                  <SelectItem value="50">50 {t("common.perPage")}</SelectItem>
                  <SelectItem value="100">100 {t("common.perPage")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={column.sortable && sorting ? "cursor-pointer select-none" : ""}
                  onClick={() => column.sortable && sorting && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && sorting && sorting.sortKey === column.key && (
                      <span className="ml-1">
                        {sorting.sortDirection === "asc" ? (
                          <ArrowUpAZ className="h-4 w-4" />
                        ) : (
                          <ArrowDownAZ className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actionColumn && <TableHead>{t("common.actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actionColumn ? 1 : 0)} className="h-24 text-center">
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key as string}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {actionColumn && <TableCell>{actionColumn(item)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pageCount > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                  className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let pageNum = i + 1;

                // Adjust visible pages based on current page
                if (pageCount > 5) {
                  if (pagination.currentPage > 3) {
                    pageNum = pagination.currentPage + i - 2;
                  }

                  if (pagination.currentPage > pageCount - 2) {
                    pageNum = pageCount - 4 + i;
                  }
                }

                if (pageNum <= 0 || pageNum > pageCount) return null;

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === pagination.currentPage}
                      onClick={() => pagination.onPageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.onPageChange(Math.min(pageCount, pagination.currentPage + 1))}
                  className={pagination.currentPage >= pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;