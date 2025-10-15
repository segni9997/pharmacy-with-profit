import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Eye, Download, Trash } from "lucide-react";
import * as XLSX from 'xlsx';
import { useGetSalesQuery, useGetSaleByIdQuery, useDeleteSaleMutation } from "@/store/saleApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function SoldMedicines() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterType, setFilterType] = useState<"date" | "week" | "month">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = useQueryParamsState();

  const { data: salesData, refetch } = useGetSalesQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
  }, {
    // Refetch when these params change
    refetchOnMountOrArgChange: true,
  });
console.log(salesData)
  // Refetch data when itemsPerPage changes
  useEffect(() => {
    refetch();
  }, [itemsPerPage, refetch]);
  const { data: saleDetail } = useGetSaleByIdQuery(selectedSaleId || "", {
    skip: !selectedSaleId,
  });
  const [deleteSale] = useDeleteSaleMutation();
  const filteredSales = useMemo(() => {
    if (!salesData?.results) return [];

    let startDate: Date;
    let endDate: Date;

    switch (filterType) {
      case "date":
        if (!selectedDate) return salesData.results;
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        if (!selectedWeek) return salesData.results;
        const [year, week] = selectedWeek.split("-W");
        const firstDayOfWeek = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
        const day = firstDayOfWeek.getDay();
        const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(firstDayOfWeek.setDate(diff));
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        if (!selectedMonth) return salesData.results;
        const [monthYear, month] = selectedMonth.split("-");
        startDate = new Date(parseInt(monthYear), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(monthYear), parseInt(month), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return salesData.results;
    }

    return salesData.results.filter((sale) => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [salesData, filterType, selectedDate, selectedWeek, selectedMonth]);

  const handleViewDetail = (saleId: string) => {
    setSelectedSaleId(saleId);
  };

  const closeDetail = () => {
    setSelectedSaleId(null);
  };

  // Removed refund handler as per user request

  const handleExport = () => {
    if (!filteredSales || filteredSales.length === 0) {
      alert("No sales data to export.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Prepare data for export
    const exportData = filteredSales.map(sale => ({
      Date: new Date(sale.sale_date).toLocaleDateString(),
      Customer: sale.customer_name || "N/A",
      "Base Price": sale.base_price,
      "Discount Amount": sale.discounted_amount,
      "Discount Percentage": sale.discount_percentage,
      "Sold (Birr)": sale.total_amount,
      "Sold By": sale.discounted_by_username || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Sold Medicines");

    // Function to convert string to array buffer
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    };

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sold_medicines.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (saleId: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-destructive/15 p-2">
        <p>Are you sure you want to delete this sale?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              toast.dismiss(t);
              deleteSale(saleId)
                .unwrap()
                .then(() => {
                  toast.success("Sale deleted successfully");
                  refetch();
                })
                .catch(() => toast.error("Failed to delete sale"));
            }}
            className="bg-destructive text-destructive-foreground"
          >
            Yes
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t)}>
            No
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl text-lg font-bold text-primary">
              Sold Medicines
            </h1>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales Records
            </CardTitle>
            <CardDescription>
              View and filter sold medicines by date, week, or month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="space-y-2">
                <Label>Filter Type</Label>
                <Select
                  value={filterType}
                  onValueChange={(value: "date" | "week" | "month") =>
                    setFilterType(value)
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
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {filterType === "week" && (
                <div className="space-y-2">
                  <Label>Select Week</Label>
                  <Input
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                  />
                </div>
              )}

              {filterType === "month" && (
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Sales Table */}
            <div className="max-h-96 overflow-y-auto">
              {filteredSales.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No sales found for the selected filter
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>Sale ID</TableHead> */}
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>discount Amount</TableHead>
                      <TableHead>discount Percentage</TableHead>
                      <TableHead>Sold(Birr)</TableHead>
                      <TableHead>Sold By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        {/* <TableCell>{sale.id}</TableCell> */}
                        <TableCell>
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sale.customer_name || "N/A"}</TableCell>
                        <TableCell>Birr {sale.base_price}</TableCell>
                        <TableCell>Birr {sale.discounted_amount}</TableCell>
                        <TableCell>% {sale.discount_percentage}</TableCell>
                        <TableCell>Birr {sale.total_amount}</TableCell>

                        <TableCell>{sale.discounted_by_username || "-"}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetail(sale.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(sale.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate("/invoice", {
                                state: { saleId: sale.id },
                              })
                            }
                          >
                            Invoice
                          </Button>
                       
                          {/* Removed edit button as per user request */}
                          {/* Removed refund button as per user request */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {salesData?.pagination && (
              <Pagination
                currentPage={salesData.pagination.pageNumber}
                totalPages={salesData.pagination.totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Sale Detail Dialog */}
      <Dialog open={!!selectedSaleId} onOpenChange={closeDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected sale
            </DialogDescription>
          </DialogHeader>

          {saleDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <Label>Sale ID</Label>
                  <p className="text-sm">{saleDetail.id}</p>
                </div> */}
                <div>
                  <Label>Date</Label>
                  <p className="text-sm">
                    {new Date(saleDetail.sale_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <p className="text-sm">{saleDetail.customer_name || "N/A"}</p>
                </div>
                <div>
                  <Label>Customer Phone</Label>
                  <p className="text-sm">
                    {saleDetail.customer_phone || "N/A"}
                  </p>
                </div>
                <div>
                  <Label>Base Price</Label>
                  <p className="text-sm">Birr {saleDetail.total_amount}</p>
                </div>
                <div>
                  <Label>discount Amount</Label>
                  <p className="text-sm">Birr {saleDetail.discounted_amount}</p>
                </div>
                <div>
                  <Label>discount Percentage</Label>
                  <p className="text-sm">% {saleDetail.discount_percentage}</p>
                </div>

                <div>
                  <Label>Total Amount</Label>
                  <p className="text-sm">Birr {saleDetail.total_amount}</p>
                </div>
                <div>
                  <Label>Sold By</Label>
                  <p className="text-sm">{saleDetail.discounted_by}</p>
                </div>
              </div>

              {/* Sale Items */}
              <div>
                <Label>Sale Items</Label>
                {saleDetail.items && saleDetail.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Sold(Birr)</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleDetail.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.medicine_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          {/* <TableCell>Birr {item.}</TableCell> */}
                          <TableCell>Birr {item.price}</TableCell>
                          <TableCell>Birr {item.total_price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No items available
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={closeDetail}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
