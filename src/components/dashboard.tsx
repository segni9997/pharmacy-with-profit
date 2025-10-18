"use client";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Activity,
  Package,
  AlertTriangle,
  Calendar,
  Users,
  LogOut,
  DollarSign,
  TrendingUp,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetOverviewQuery } from "@/store/dashboardApi";
import type { OverviewData } from "@/lib/types";
import { useWhoamiQuery } from "@/store/userApi";

export function Dashboard() {
  // const [user, setUser] = useState<DecodedToken | null>(null);
  const { data: apiData, isLoading, error } = useGetOverviewQuery();
  
  // const user: any = jwtDecode(localStorage.getItem("access_token") || "");
  const {data:user} = useWhoamiQuery();
  const overviewData: OverviewData | null =
    apiData ||
    (error
      ? {
          stock: {
            total_medicines: 3,
            low_stock: 0,
            stock_out: 0,
            expired: 0,
            near_expiry: 0,
          },
          sales: {
            today_sales_qty: 7,
            total_sales_qty: 7,
            revenue_today: 42.5,
            total_revenue: 42.5,
          },
          profit: {
            today_profit: 0,
            total_profit: 0,
          },
          top_selling: [
            {
              medicine__brand_name: "Almendazol",
              total_sold: 5,
            },
            {
              medicine__brand_name: "Tayfoid",
              total_sold: 2,
            },
          ],
          departments: [
            {
              department__name: "ANTI BACTERIA DRUG",
              total: 1,
              total_profit: 0,
            },
            {
              department__name: "ANTI BIOTIC DRUG",
              total: 2,
              total_profit: 0,
            },
          ],
        }
      : null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (isLoading || !overviewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-semibold text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl text-md font-bold md:font-extrabold text-primary tracking-wide">
              TO HIM PHARMACY
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:flex text-base text-foreground font-semibold">
              Welcome, {user?.username || "User"}
            </span>
            <Link to="/profile">
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary rounded-full hover:bg-primary/10 bg-transparent"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
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

      <main className="p-8 md:max-w-9xl w-full mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-foreground mb-2">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Overview of your pharmacy operations
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold">
                Today's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary-foreground opacity-80" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-extrabold">
                Birr {overviewData.sales.revenue_today.toFixed(2)}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">
                {overviewData.sales.today_sales_qty} items sold
              </p>
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow cursor-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                <CardTitle className="text-xs font-semibold">
                  Today's Profit
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-white opacity-80" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-extrabold">
                  Birr {overviewData.profit.today_profit.toFixed(2)}
                </div>
                <p className="text-[10px] opacity-80 mt-0.5">Profit today</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold">
                Total Medicines
              </CardTitle>
              <Package className="h-4 w-4 text-secondary-foreground opacity-80" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-extrabold">
                {overviewData.stock.total_medicines}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">Active items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning-foreground opacity-80" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-extrabold">
                {overviewData.stock.low_stock}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">Below threshold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4 to-chart-4/80 text-warning-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold">
                Near Expiry
              </CardTitle>
              <Calendar className="h-4 w-4 text-warning-foreground opacity-80" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-extrabold">
                {overviewData.stock.near_expiry}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">Expiring soon</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-lg hover:shadow-xl transition-shadow cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive-foreground opacity-80" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-extrabold">
                {overviewData.stock.expired}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-10">
          <Link to="/medicines">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Package className="h-6 w-6 text-primary" />
                  Medicine Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  manage your medicine Medicine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Manage Medicines
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/pos">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Activity className="h-6 w-6 text-primary" />
                  Point of Sale
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Process sales and generate receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Open POS
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/sold-medicines">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Sold Medicines
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View sold medicines and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  View Sold Medicines
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View sales reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </Link>

          {user?.role === "admin" && (
            <>
              <Link to="/users">
                <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <Users className="h-6 w-6 text-primary" />
                      Manage Users
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Add, edit, and manage system users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>
              </Link>

          
            </>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-10">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Top Selling Medicines
              </CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewData.top_selling.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sales data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {overviewData.top_selling.map((medicine, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-foreground text-lg">
                          {medicine.medicine__brand_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {medicine.total_sold}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          units sold
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-6 w-6 text-secondary" />
                Department Overview
              </CardTitle>
              <CardDescription>Medicine by department</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewData.departments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No department data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {overviewData.departments.map((dept, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-lg border border-secondary/20 hover:shadow-md transition-shadow"
                    >
                      <span className="font-semibold text-foreground">
                        {dept.department__name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-secondary">
                          {dept.total}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {user?.role === "admin" && (
          <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Revenue & Profit Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-card rounded-lg shadow">
                  <p className="text-sm text-muted-foreground mb-2">
                    Today's Sales
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    Birr {overviewData.sales.revenue_today.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overviewData.sales.today_sales_qty} transactions
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow">
                  <p className="text-sm text-muted-foreground mb-2">
                    Today's Profit
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    Birr {overviewData.profit.today_profit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    profit earned today
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow">
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-secondary">
                    Birr {overviewData.sales.total_revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overviewData.sales.total_sales_qty} total transactions
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow">
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Profit
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    Birr {overviewData.profit.total_profit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    all-time profit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
