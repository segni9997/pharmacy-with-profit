"use client";

export type UserRole = "admin" | "pharmacist" | "cashier";

export interface User {
  id: string;
  name?: string;
  username: string;
  email?: string;
  role: UserRole;
  createdAt?: Date;
}
export interface Userinfo {
  id: string;
  name?: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: UserRole;
  createdAt?: Date;
}


export interface RefillRecord {
  initialQuantity: number;
  refillDate: Date;
  endDate?: Date;
  batchNumber: string;
}

export interface Refill {
  medicine: string;
  department: string;
  batch_number: string;
  batch_no: string;
  manufacture_date: string;
  company_name: string;
  FSNO: string;
  expire_date: string;
  price: string | number;
  quantity: number;
  refill_date: string;
  end_date: string | null;
  code_no: string;
}

export interface Medicine {
  id: string;
  is_out_of_stock: boolean;
  is_expired: boolean;
  is_nearly_expired: boolean;
  code_no: string;
  brand_name: string;
  generic_name: string;
  batch_no: string;
  manufacture_date: string; // ISO date string
  expire_date: string; // ISO date string
  price: string; // string to keep consistent with user input, e.g. "10.50"
  stock: number;
  low_stock_threshold: number;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  department: string;
  created_by: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  createdAt: Date;
}


export interface Sale {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  vat_regno?: string;
  fno?: string;
  payment_method?: string;
  discounted_amount: string;
  base_price: string;
  discount_percentage: string;

  discounted_by: string;
  discounted_by_username: string;
  total_amount: string;
  sale_date: string;
  sold_by: string;
  sold_by_name: string;
  sold_by_username?: string;

  voucher_number: string;
  TIN_number?: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  medicine: string;
  batch_no: string;
  medicine_name: string;
  quantity: number;
  price: string;
  total_price: string;
  expire_date: string;
  code_no: string;
  unit_type: string;
  sale_type: string;
}

export interface DashboardStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  totalMedicines: number;
  lowStockCount: number;
  expiredCount: number;
  nearExpiryCount: number;
}

export interface AnalyticsData {
  summary: {
    total_revenue: number;
    total_transactions: number;
    avg_order_value: number;
    inventory_value: number;
  };
  sales_trend: Array<{
    day: string;
    total_sales: number;
  }>;
  inventory_by_category: Array<{
    department__name: string;
    value: number;
    profit: number;
  }>;
  top_selling: Array<{
    medicine__brand_name: string;
    total_sold: number;
  }>;
  stock_alerts: {
    low_stock: any[];
    stock_out: any[];
    near_expiry: {
      id: string;
      batch_no: string;
      brand_name: string;
      expire_date: string;
      item_name: number;
    }[];
    
  };
  weekly_summary: {
    week_sales: number;
    transactions: number;
    // new_customers: number; // ❌ not in backend
  };
  inventory_health: {
    total_products: number;
    low_stock: number;
    near_expiry: number;
    stock_out: number;
  };
  performance_metrics: {
    // profit_margin: number; // ❌ not in backend’s performance_metrics
    inventory_turnover: number;
    // customer_satisfaction: number; // ❌ not in backend
  };
}


export interface OverviewData {
  stock: {
    total_medicines: number;
    low_stock: number;
    stock_out: number;
    expired: number;
    near_expiry: number;
  };
  sales: {
    today_sales_qty: number;
    total_sales_qty: number;
    revenue_today: number;
    total_revenue: number;
  };
  profit: {
    today_profit: number;
    total_profit: number;
  };
  top_selling: Array<{
    medicine__brand_name: string;
    total_sold: number;
  }>;
  departments: Array<{
    department__name: string;
    total: number;
    total_profit: number; // ✅ added
  }>;
}
export interface ProfitSummary {
  daily_profit: number;
  weekly_profit: number;
  monthly_profit: number;
}

export interface Settings {
  id: string;
  discount: number;
  low_stock_threshold: number;
  expired_date: number; // days
}
