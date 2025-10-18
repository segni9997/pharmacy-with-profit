"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  DollarSign,
  User,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import type { Sale } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { toast } from "sonner";
import { useDeleteSaleMutation, useGetSalesQuery } from "@/store/saleApi";

type FilterType = "date" | "week" | "month";

function filterSalesByDateRange(
  sales: Sale[],
  filterType: FilterType,
  selectedValue: string
): Sale[] {
  if (!selectedValue) return sales;

  let startDate: Date;
  let endDate: Date;

  switch (filterType) {
    case "date":
      startDate = new Date(selectedValue);
      endDate = new Date(selectedValue);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      const [year, week] = selectedValue.split("-W");
      const firstDayOfWeek = new Date(
        Number.parseInt(year),
        0,
        1 + (Number.parseInt(week) - 1) * 7
      );
      const day = firstDayOfWeek.getDay();
      const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(firstDayOfWeek.setDate(diff));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      const [monthYear, month] = selectedValue.split("-");
      startDate = new Date(
        Number.parseInt(monthYear),
        Number.parseInt(month) - 1,
        1
      );
      endDate = new Date(Number.parseInt(monthYear), Number.parseInt(month), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      return sales;
  }

  return sales.filter((sale) => {
    const saleDate = new Date(sale.sale_date);
    return saleDate >= startDate && saleDate <= endDate;
  });
}

export default function SalesDetailPage() {
  const [filterType, setFilterType] = useState<FilterType>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [activeExpandedId, setActiveExpandedId] = useState<string | null>(null);

  const { currentPage, setCurrentPage, itemsPerPage, setItemsPerPage } =
    useQueryParamsState();

  const {
    data: salesResponse,
    isLoading,
    error,
    refetch,
  } = useGetSalesQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
console.log(salesResponse)
  useEffect(() => {
    refetch();
  }, [itemsPerPage, refetch]);

  const selectedValue =
    filterType === "date"
      ? selectedDate
      : filterType === "week"
      ? selectedWeek
      : selectedMonth;

  const filteredSales = useMemo(() => {
    if (!salesResponse?.results) return [];
    return filterSalesByDateRange(
      salesResponse.results,
      filterType,
      selectedValue
    );
  }, [salesResponse?.results, filterType, selectedValue]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number.parseFloat(sale.total_amount || "0"),
    0
  );
  const totalItems = filteredSales.reduce((sum, sale) => {
    return (
      sum +
      (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0)
    );
  }, 0);

  const handleFilterChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
    setSelectedDate("");
    setSelectedWeek("");
    setSelectedMonth("");
    setCurrentPage(1);
    setActiveExpandedId(null);
  };

const toggleExpanded = (saleId: string) => {
  setActiveExpandedId((prev) => (prev === saleId ? null : saleId));
};

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <p className="mt-4 text-muted-foreground">Loading sales data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Error loading sales data
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your connection and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground/90 mb-2">
            Sales Details
          </h1>
          <p className="text-muted-foreground">
            Track your sales performance by date, week, or month
          </p>
        </div>

        {/* Filters Card */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales Records
            </CardTitle>
            <CardDescription>
              View and filter sales by date, week, or month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label>Filter Type</Label>
                <Select
                  value={filterType}
                  onValueChange={(value: FilterType) =>
                    handleFilterChange(value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="week">By Week</SelectItem>
                    <SelectItem value="month">By Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType === "date" && (
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}

              {filterType === "week" && (
                <div className="space-y-2">
                  <Label>Select Week</Label>
                  <Input
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => {
                      setSelectedWeek(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}

              {filterType === "month" && (
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground/90">
               Birr &nbsp;
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                Total Items Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground/90">
                {totalItems.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Cards Grid */}
        {filteredSales.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No sales found for the selected filter
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-start">
              {paginatedSales.map((sale) => (
                <SalesCard
                  key={sale.id}
                  sale={sale}
                  isExpanded={activeExpandedId === sale.id}
                  onToggleExpand={() => toggleExpanded(sale.id)}
                  onDelete={refetch}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Items per page:</Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) =>
                      setItemsPerPage(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-10"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SalesCard({
  sale,
  isExpanded,
  onToggleExpand,
  onDelete,
}: {
  sale: Sale;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSale] = useDeleteSaleMutation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" ;

  const totalValue = Number.parseFloat(sale.total_amount || "0");
  const totalItems =
    sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const saleDate = new Date(sale.sale_date);
  const formattedDate = saleDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = () => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-destructive/15 p-4 rounded-lg border border-destructive/20">
        <p className="font-medium">
          Are you sure you want to delete this sale?
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              toast.dismiss(t);
              setIsDeleting(true);
              deleteSale(sale.id)
                .unwrap()
                .then(() => {
                  toast.success("Sale deleted successfully");
                  onDelete();
                })
                .catch(() => {
                  toast.error("Failed to delete sale");
                })
                .finally(() => setIsDeleting(false));
            }}
            className="bg-destructive text-destructive-foreground"
          >
            Yes, Delete
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t)}>
            Cancel
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Card className="bg-background/70 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 h-fit overflow-hidden group pt-0">
      <CardHeader className="pb-4 bg-gradient-to-br from-background via-background to-background/90 relative overflow-hidden pt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-background/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <div className="text-xs font-bold text-background-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Naty Pharmacy
            </div>
            <CardTitle className="text-lg text-foreground/50 font-bold">
              {totalItems} Items Sold
            </CardTitle>
            <p className="text-xs text-foreground/70 mt-1">
              to {sale.customer_name || "Anonymous Customer"}
            </p>
          </div>
          <button
            onClick={onToggleExpand}
            className="ml-2 p-2 bg-gradient-to-br from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="pt-6 space-y-3 overflow-hidden bg-background rounded-b-lg">
          {/* Total Value */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
            <span className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Total Value
            </span>
            <span className="font-bold text-primary text-xl">
              Birr{" "}
              {totalValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Sold by */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
            <div className="p-2 bg-primary/15 rounded-lg">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground block">
                Sold by
              </span>
              <span className="font-semibold text-foreground/90">
                {sale.sold_by_username || sale.sold_by}
              </span>
            </div>
          </div>

          {/* Stock Sold */}
          <div className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/15 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/90 font-medium">
                Stock Sold
              </span>
            </div>
            <span className="font-bold text-foreground/90">
              {totalItems} units
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground block">
                Date & Time
              </span>
              <span className="font-medium text-foreground/90 text-sm">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Customer */}
          {sale.customer_name && (
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-foreground mb-2 font-semibold uppercase tracking-wide">
                Customer
              </p>
              <p className="font-semibold text-foreground/90 mb-1">
                {sale.customer_name}
              </p>
              {sale.customer_phone && (
                <p className="text-sm text-muted-foreground">
                  {sale.customer_phone}
                </p>
              )}
            </div>
          )}

          {/* Payment Method */}
          {sale.payment_method && (
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1 font-semibold">
                Payment Method
              </p>
              <p className="font-medium text-foreground/90 capitalize">
                {sale.payment_method}
              </p>
            </div>
          )}

          {/* Discount */}
          {sale.discount_percentage &&
            Number.parseFloat(sale.discount_percentage) > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-xs text-destructive mb-1 font-semibold">
                  Discount Applied
                </p>
                <p className="font-bold text-destructive">
                  {sale.discount_percentage}% off
                </p>
              </div>
            )}

          {/* Items */}
          {sale.items && sale.items.length > 0 && (
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
                Items in Sale
              </p>
              <div className="space-y-2">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="text-sm text-foreground/90 flex justify-between items-center p-2 bg-background rounded hover:bg-accent/10 transition-colors"
                  >
                    <span className="font-medium">{item.medicine_name}</span>
                    <span className="text-muted-foreground font-semibold">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      ) : (
        /* Collapsed View */
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/15 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/90">Stock Sold</span>
            </div>
            <span className="font-bold text-foreground/90">
              {totalItems} units
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground block">
                Date & Time
              </span>
              <span className="font-medium text-foreground/90 text-sm">
                {formattedDate}
              </span>
            </div>
          </div>
        </CardContent>
      )}

      {/* Delete Button (Admin Only) */}
      {isAdmin && (
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
            size="sm"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : ""}
          </Button>
        </div>
      )}
    </Card>
  );
}
