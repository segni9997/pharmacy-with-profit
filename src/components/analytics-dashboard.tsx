import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  LogOut,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
// import * as XLSX from "xlsx";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useGetAnalyticsQuery,
  useGetProfitSummaryQuery,
} from "@/store/dashboardApi";
import { NavDropdown } from "./navDropDown";

interface DecodedToken {
  username?: string;
  role?: string;
  exp?: number;
}

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery();
  console.log(analyticsData)
  const { data: profit, isLoading: isProfitLoading } =
    useGetProfitSummaryQuery();
  console.log("profit", profit);
  const [user, setUser] = useState<DecodedToken | null>(null);

  const profitChartData = profit
    ? [
        { period: "Daily", profit: profit.daily_profit },
        { period: "Weekly", profit: profit.weekly_profit },
        { period: "Monthly", profit: profit.monthly_profit },
      ]
    : [];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser(decoded);
      } catch (error) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // const handleExport = () => {
  //   if (!analyticsData) {
  //     alert("Analytics data is not loaded yet.");
  //     return;
  //   }

  //   const wb = XLSX.utils.book_new();

  //   // Summary sheet
  //   const summaryData = [
  //     {
  //       Metric: "Total Revenue",
  //       Value: analyticsData.summary.total_revenue.toFixed(2),
  //     },
  //     {
  //       Metric: "Total Transactions",
  //       Value: analyticsData.summary.total_transactions,
  //     },
  //     {
  //       Metric: "Avg. Order Value",
  //       Value: analyticsData.summary.avg_order_value.toFixed(2),
  //     },
  //     {
  //       Metric: "Medicine Value",
  //       Value: analyticsData.summary.inventory_value.toFixed(2),
  //     },
  //   ];
  //   const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  //   XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  //   // Sales Trend sheet
  //   const wsSalesTrend = XLSX.utils.json_to_sheet(analyticsData.sales_trend);
  //   XLSX.utils.book_append_sheet(wb, wsSalesTrend, "Sales Trend");

  //   // Inventory by Category sheet
  //   const wsInventoryCategory = XLSX.utils.json_to_sheet(
  //     analyticsData.inventory_by_category
  //   );
  //   XLSX.utils.book_append_sheet(
  //     wb,
  //     wsInventoryCategory,
  //     "Medicine by Category"
  //   );

  //   // Top Selling Products sheet
  //   const wsTopSelling = XLSX.utils.json_to_sheet(analyticsData.top_selling);
  //   XLSX.utils.book_append_sheet(wb, wsTopSelling, "Top Selling");

  //   // Stock Alerts sheet (combine all alerts)
  //   const stockAlerts = [
  //     ...analyticsData.stock_alerts.low_stock.map((item: any) => ({
  //       ...item,
  //       alert_type: "Low Stock",
  //     })),
  //     ...analyticsData.stock_alerts.stock_out.map((item: any) => ({
  //       ...item,
  //       alert_type: "Stock Out",
  //     })),
  //     ...analyticsData.stock_alerts.near_expiry.map((item: any) => ({
  //       ...item,
  //       alert_type: "Near Expiry",
  //     })),
  //   ];
  //   const wsStockAlerts = XLSX.utils.json_to_sheet(stockAlerts);
  //   XLSX.utils.book_append_sheet(wb, wsStockAlerts, "Stock Alerts");

  //   // Weekly Summary sheet
  //   const weeklySummaryData = [
  //     {
  //       Metric: "Total Sales",
  //       Value: analyticsData.weekly_summary.week_sales.toFixed(2),
  //     },
  //     {
  //       Metric: "Transactions",
  //       Value: analyticsData.weekly_summary.transactions,
  //     },
  //     // { Metric: "New Customers", Value: analyticsData.weekly_summary.new_customers },
  //   ];
  //   const wsWeeklySummary = XLSX.utils.json_to_sheet(weeklySummaryData);
  //   XLSX.utils.book_append_sheet(wb, wsWeeklySummary, "Weekly Summary");

  //   // Inventory Health sheet
  //   const inventoryHealthData = [
  //     {
  //       Metric: "Total Products",
  //       Value: analyticsData.inventory_health.total_products,
  //     },
  //     { Metric: "Low Stock", Value: analyticsData.inventory_health.low_stock },
  //     {
  //       Metric: "Near Expiry",
  //       Value: analyticsData.inventory_health.near_expiry,
  //     },
  //     {
  //       Metric: "Out of Stock",
  //       Value: analyticsData.inventory_health.stock_out,
  //     },
  //   ];
  //   const wsInventoryHealth = XLSX.utils.json_to_sheet(inventoryHealthData);
  //   XLSX.utils.book_append_sheet(wb, wsInventoryHealth, "Medicine Health");

  //   // Performance Metrics sheet
  //   const performanceMetricsData = [
  //     // {
  //     //   Metric: "Profit Margin",
  //     //   Value: analyticsData.performance_metrics.profit_margin.toFixed(2) + "%",
  //     // },
  //     {
  //       Metric: "Medicine Turnover",
  //       Value: analyticsData.performance_metrics.inventory_turnover.toFixed(2),
  //     },
  //     // {
  //     //   Metric: "Customer Satisfaction",
  //     //   Value:
  //     //     analyticsData.performance_metrics.customer_satisfaction.toFixed(1) +
  //     //     "/5",
  //     // },
  //   ];
  //   const wsPerformanceMetrics = XLSX.utils.json_to_sheet(
  //     performanceMetricsData
  //   );
  //   XLSX.utils.book_append_sheet(
  //     wb,
  //     wsPerformanceMetrics,
  //     "Performance Metrics"
  //   );

  //   // Function to convert string to array buffer
  //   const s2ab = (s: string) => {
  //     const buf = new ArrayBuffer(s.length);
  //     const view = new Uint8Array(buf);
  //     for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  //     return buf;
  //   };

  //   const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  //   const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "analytics_data.xlsx";
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <NavDropdown />
      </div>
      <header className="border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl hidden md:flex text-lg font-bold text-primary">
              Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="hidden md:flex text-xs">
              {user?.role?.toUpperCase()}
            </Badge>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <Download className="h-5 w-5 mr-2" />
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="md:p-6 p-2 space-y-6 max-w-8xl mx-auto">
        {user?.role == "admin" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-foreground opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Birr {analyticsData.summary.total_revenue.toFixed(2)}
                </div>
                <div className="flex items-center text-xs opacity-80 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <Users className="h-4 w-4 text-foreground opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.summary.total_transactions}
                </div>
                <div className="flex items-center text-xs opacity-80 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Order Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-foreground opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Birr {analyticsData.summary.avg_order_value.toFixed(2)}
                </div>
                <div className="flex items-center text-xs opacity-80 mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Medicine Value
                </CardTitle>
                <Package className="h-4 w-4 text-foreground opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Birr {analyticsData.summary.inventory_value.toFixed(2)}
                </div>
                <div className="flex items-center text-xs opacity-80 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.4% from last period
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Daily sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales (Birr)",
                    color: "var(--color-primary)",
                  },
                }}
                className="h-80 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.sales_trend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                    />
                    <XAxis dataKey="day" stroke="var(--color-foreground)" />
                    <YAxis stroke="var(--color-foreground)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_sales"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      name="Sales (Birr)"
                      dot={{ fill: "var(--color-primary)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profit Summary</CardTitle>
              <CardDescription>Profit breakdown by time period</CardDescription>
            </CardHeader>
            <CardContent>
              {isProfitLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-sm text-gray-600">
                    Loading profit data...
                  </div>
                </div>
              ) : profit ? (
                <ChartContainer
                  config={{
                    profit: {
                      label: "Profit (Birr)",
                      color: "var(--color-primary)",
                    },
                  }}
                  className="h-80 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="period"
                        stroke="var(--color-foreground)"
                      />
                      <YAxis stroke="var(--color-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="profit"
                        fill="var(--color-primary)"
                        name="Profit (Birr)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-sm text-gray-600">
                    No profit data available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Medicine by Category</CardTitle>
              <CardDescription>Distribution of medicine value</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Value (Birr)",
                    color: "var(--color-primary)",
                  },
                }}
                className="h-80 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.inventory_by_category}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        `${
                          entry?.department__name &&
                          typeof entry.department__name === "string"
                            ? entry.department__name.slice(0, 15)
                            : "Unknown"
                        } ${(entry?.percent ?? 0 * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="var(--color-primary)"
                      dataKey="value"
                    >
                      {analyticsData.inventory_by_category.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index % 2 === 0
                              ? "var(--color-primary)"
                              : "var(--color-secondary)"
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products by sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Units Sold",
                    color: "var(--color-primary)",
                  },
                }}
                className="h-80 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.top_selling} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                    />
                    <XAxis type="number" stroke="var(--color-foreground)" />
                    <YAxis
                      dataKey="medicine__brand_name"
                      type="category"
                      width={120}
                      stroke="var(--color-foreground)"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="total_sold"
                      fill="var(--color-primary)"
                      name="Units Sold"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>
                Products requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analyticsData.stock_alerts.low_stock.length === 0 &&
                analyticsData.stock_alerts.stock_out.length === 0 &&
                analyticsData.stock_alerts.near_expiry.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No stock alerts at this time
                  </p>
                ) : (
                  <>
                    {analyticsData.stock_alerts.low_stock.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {item.brand_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Current stock: {item.stock} units
                            </p>
                          </div>
                          <Badge
                            variant="destructive"
                            className="text-xs bg-orange-600"
                          >
                            Low Stock
                          </Badge>
                        </div>
                      )
                    )}
                    {analyticsData.stock_alerts.stock_out.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {item.brand_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Out of stock
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            Stock Out
                          </Badge>
                        </div>
                      )
                    )}
                    {analyticsData.stock_alerts.near_expiry.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm flex flex-col">
                              <h3>{item.item_name}</h3>
                              <span className="text-foreground/80">{item.brand_name}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Expires soon on: {item.expire_date}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-yellow-600"
                          >
                            Near Expiry
                          </Badge>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sales:</span>
                <span className="font-semibold text-lg">
                  Birr {analyticsData.weekly_summary.week_sales.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions:</span>
                <span className="font-semibold text-lg">
                  {analyticsData.weekly_summary.transactions}
                </span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Customers:</span>
                <span className="font-semibold text-lg">
                  {analyticsData.weekly_summary.new_customers}
                </span>
              </div> */}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary" />
                Medicine Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products:</span>
                <span className="font-semibold text-lg">
                  {analyticsData.inventory_health.total_products}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock:</span>
                <span className="font-semibold text-lg text-orange-600">
                  {analyticsData.inventory_health.low_stock}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Near Expiry:</span>
                <span className="font-semibold text-lg text-orange-600">
                  {analyticsData.inventory_health.near_expiry}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Stock:</span>
                <span className="font-semibold text-lg text-red-600">
                  {analyticsData.inventory_health.stock_out}
                </span>
              </div>
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <span className="font-semibold text-lg">
                    {analyticsData.performance_metrics.profit_margin.toFixed(2)}
                    %
                  </span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Medicine Turnover:
                  </span>
                  <span className="font-semibold text-lg">
                    {analyticsData.performance_metrics.inventory_turnover.toFixed(
                      2
                    )}
                  </span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Customer Satisfaction:
                  </span>
                  <span className="font-semibold text-lg">
                    {analyticsData.performance_metrics.customer_satisfaction.toFixed(
                      1
                    )}
                    /5
                  </span>
                </div> */}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
