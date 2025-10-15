// import type {  Category, Unit } from "./types"

// Mock data for demo
// export const mockCategories: Category[] = [
//   { id: "1", name: "Prescription", description: "Prescription medications", createdAt: new Date() },
//   { id: "2", name: "OTC", description: "Over-the-counter medications", createdAt: new Date() },
//   { id: "3", name: "Cosmetic", description: "Beauty and cosmetic products", createdAt: new Date() },
//   { id: "4", name: "Supplements", description: "Vitamins and supplements", createdAt: new Date() },
// ]

// export const mockUnits: Unit[] = [
//   { id: "1", name: "Tablets", abbreviation: "tabs", description: "Tablet form", createdAt: new Date() },
//   { id: "2", name: "Capsules", abbreviation: "caps", description: "Capsule form", createdAt: new Date() },
//   { id: "3", name: "Milliliters", abbreviation: "ml", description: "Liquid measurement", createdAt: new Date() },
//   { id: "4", name: "Grams", abbreviation: "g", description: "Weight measurement", createdAt: new Date() },
//   { id: "5", name: "Milligrams", abbreviation: "mg", description: "Milligram dosage", createdAt: new Date() },
//   { id: "6", name: "International Units", abbreviation: "IU", description: "International units", createdAt: new Date() },
//   { id: "7", name: "Pieces", abbreviation: "pcs", description: "Individual pieces", createdAt: new Date() },
//   { id: "8", name: "Bottles", abbreviation: "btl", description: "Bottle packaging", createdAt: new Date() },
// ]

// export const mockMedicines: Medicine[] = [
//   {
//     id: 1,
//     is_out_of_stock: false,
//     is_expired: false,
//     is_nearly_expired: false,
//     code_no: "PAR001",
//     brand_name: "Paracetamol 500mg",
//     generic_name: "Paracetamol",
//     batch_no: "PAR001",
//     manufacture_date: "2023-01-01",
//     expire_date: "2025-12-31",
//     price: "5.99",
//     stock: 150,
//     low_stock_threshold: 10,
//     attachment: null,
//     created_at: "2023-01-01T00:00:00Z",
//     updated_at: "2023-01-01T00:00:00Z",
//     department: 1,
//     created_by: "admin",
//   },
//   {
//     id: 2,
//     is_out_of_stock: false,
//     is_expired: false,
//     is_nearly_expired: true,
//     code_no: "AMX002",
//     brand_name: "Amoxicillin 250mg",
//     generic_name: "Amoxicillin",
//     batch_no: "AMX002",
//     manufacture_date: "2023-02-01",
//     expire_date: "2024-06-30",
//     price: "12.50",
//     stock: 8,
//     low_stock_threshold: 10,
//     attachment: null,
//     created_at: "2023-02-01T00:00:00Z",
//     updated_at: "2023-02-01T00:00:00Z",
//     department: 1,
//     created_by: "admin",
//   },
//   {
//     id: 3,
//     is_out_of_stock: false,
//     is_expired: false,
//     is_nearly_expired: false,
//     code_no: "VIT003",
//     brand_name: "Vitamin D3 1000IU",
//     generic_name: "Vitamin D3",
//     batch_no: "VIT003",
//     manufacture_date: "2023-03-01",
//     expire_date: "2026-03-15",
//     price: "18.99",
//     stock: 75,
//     low_stock_threshold: 10,
//     attachment: null,
//     created_at: "2023-03-01T00:00:00Z",
//     updated_at: "2023-03-01T00:00:00Z",
//     department: 1,
//     created_by: "admin",
//   },
//   {
//     id: 4,
//     is_out_of_stock: false,
//     is_expired: false,
//     is_nearly_expired: false,
//     code_no: "COS004",
//     brand_name: "Face Moisturizer SPF 30",
//     generic_name: "Moisturizer",
//     batch_no: "COS004",
//     manufacture_date: "2023-04-01",
//     expire_date: "2025-08-20",
//     price: "24.99",
//     stock: 45,
//     low_stock_threshold: 10,
//     attachment: null,
//     created_at: "2023-04-01T00:00:00Z",
//     updated_at: "2023-04-01T00:00:00Z",
//     department: 1,
//     created_by: "admin",
//   },
// ]

// export const mockSales: Sale[] = [
//   {
//     id: "1",
//     date: new Date(),
//     totalAmount: 43.48,
//     cashierId: "3",
//     customerName: "Alice Brown",
//     customerPhone: "+1234567890",
//     createdAt: new Date(),
//   },
// ]

// export const mockSaleItems: SaleItem[] = [
//   {
//     id: "1",
//     saleId: "1",
//     medicineId: "1",
//     quantity: 2,
//     unitPrice: 5.99,
//     totalPrice: 11.98,
//   },
//   {
//     id: "2",
//     saleId: "1",
//     medicineId: "3",
//     quantity: 1,
//     unitPrice: 18.99,
//     totalPrice: 18.99,
//   },
// ]

// export function getDashboardStats(): DashboardStats {
//   const today = new Date()
//   const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
//   const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

//   const todaySales = mockSales
//     .filter((sale) => sale.date.toDateString() === today.toDateString())
//     .reduce((sum, sale) => sum + sale.totalAmount, 0)

//   const weeklySales = mockSales.filter((sale) => sale.date >= weekAgo).reduce((sum, sale) => sum + sale.totalAmount, 0)

//   const monthlySales = mockSales
//     .filter((sale) => sale.date >= monthAgo)
//     .reduce((sum, sale) => sum + sale.totalAmount, 0)

//   const lowStockCount = mockMedicines.filter((med) => med.stock < med.low_stock_threshold).length
//   const expiredCount = mockMedicines.filter((med) => new Date(med.expire_date) < today).length
//   const nearExpiryCount = mockMedicines.filter((med) => {
//     const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
//     const expireDate = new Date(med.expire_date)
//     return expireDate <= thirtyDaysFromNow && expireDate > today
//   }).length

//   return {
//     todaySales,
//     weeklySales,
//     monthlySales,
//     totalMedicines: mockMedicines.length,
//     lowStockCount,
//     expiredCount,
//     nearExpiryCount,
//   }
// }

// New function to get top selling medicines
// export function getTopSellingMedicines() {
//   // Aggregate sales by medicineId
//   const salesByMedicine: Record<string, { sales: number; revenue: number }> = {}

//   for (const saleItem of mockSaleItems) {
//     if (!salesByMedicine[saleItem.medicineId]) {
//       salesByMedicine[saleItem.medicineId] = { sales: 0, revenue: 0 }
//     }
//     salesByMedicine[saleItem.medicineId].sales += saleItem.quantity
//     salesByMedicine[saleItem.medicineId].revenue += saleItem.totalPrice
//   }

//   // Map to array with medicine name
//   const result = Object.entries(salesByMedicine).map(([medicineId, data]) => {
//     const medicine = mockMedicines.find((med) => med.id.toString() === medicineId)
//     return {
//       name: medicine ? medicine.brand_name : "Unknown",
//       sales: data.sales,
//       revenue: data.revenue,
//     }
//   })

//   // Sort by sales descending and take top 5
//   result.sort((a, b) => b.sales - a.sales)
//   return result.slice(0, 5)
// }
