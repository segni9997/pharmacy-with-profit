
import type React from "react";
import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  // AlertTriangle,
  // Calendar1Icon,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  X,
  Menu,
  CalendarIcon,
} from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  type Unit,
} from "@/store/unitApi";
import { toast } from "sonner";
import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  type MedicineUnit,
  type GetMedicine,
} from "@/store/medicineApi";

import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";
import { useGetSettingsQuery } from "@/store/settingsApi";
import { NavDropdown } from "./navDropDown";
import { useLazyExportExcelQuery } from "@/store/exportApi";

export function MedicineManagement() {
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    unit,
    setUnit,
    batchNo,
    setBatchNo,
    searchValue,
    setSearchValue
  } = useQueryParamsState();

  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [unitItemsPerPage, setUnitItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    brand_name: "",
    items_name: "",
    batch_no: "",
    manufacture_date: "",
    department: "",
    company_name: "",
    unit_type: "Strip" as MedicineUnit,
    low_threshold: "",
    expired_date: "",
    piece_price: "",
    buying_price: "",
    price: "",
    stock:"",
    stock_carton: "",
    stock_in_unit: "",
    units_per_carton:"",
    expire_date: "",
    unit: "Strip" as MedicineUnit,
    TIN_number: "",
  });
  // Apis
  const { data: Units, refetch } = useGetUnitsQuery(
    {
      pageNumber: unitCurrentPage,
      pageSize: unitItemsPerPage,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
   const { data: UnitsSelection } = useGetUnitsQuery(
     {
       pageNumber: unitCurrentPage,
       pageSize: unitItemsPerPage,
     },
     {
       refetchOnMountOrArgChange: true,
     }
   );
  const { data: meds, refetch: refetchMeds } = useGetMedicinesQuery(
    {
      pageNumber: currentPage,
      pageSize: itemsPerPage,
      unit,
      batch_no: batchNo,
      search:searchValue
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
console.log(meds)
  const { data: settings } = useGetSettingsQuery()
  console.log(settings)
  const [AddUnit, { isLoading: isUnitAdding }] = useCreateUnitMutation();
  const [UpdateUnit] = useUpdateUnitMutation();
  const [DeleteUnit] = useDeleteUnitMutation();
  const [CreateMedicine, { isLoading: isCreating }] =
    useCreateMedicineMutation();
  const [UpdateMedicine] = useUpdateMedicineMutation();
  const [DeleteMedicine] = useDeleteMedicineMutation();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUnitType, setSelectedUnitType] = useState<string>("all");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<GetMedicine | null>(
    null
  );

  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [unitFormData, setUnitFormData] = useState({
    id: "",
    code: "",
    name: "",
  });

  const unitTypeOptions: { value: MedicineUnit; label: string }[] = [
    { value: "Bottle", label: "Bottle" },
    { value: "Sachet", label: "Sachet" },
    { value: "Ampule", label: "Ampule" },
    { value: "Vial", label: "Vial" },
    { value: "Tin", label: "Tin" },
    { value: "Strip", label: "Strip" },
    { value: "Tube", label: "Tube" },
    { value: "Box", label: "Box" },
    { value: "Cosmetics", label: "Cosmetics" },
    { value: "10 x 100", label: "10 x 100" },
    { value: "Of 10", label: "Of 10" },
    { value: "Of 20", label: "Of 20" },
    { value: "Of 14", label: "Of 14" },
    { value: "Of 28", label: "Of 28" },
    { value: "Of 30", label: "Of 30" },
    { value: "Suppository", label: "Suppository" },
    { value: "Pcs", label: "Pcs" },
    { value: "Tablet", label: "Tablet" },
    { value: "Pk", label: "PK" },
  ];

  // stock calculation start here
const calculateTotalPieces = () => {
  const cartons = Number.parseInt(formData.stock_carton) || 0;
  const itemsPerCarton = Number.parseInt(formData.units_per_carton) || 0;
  const totalPieces = (cartons * itemsPerCarton) + (Number.parseInt(formData.stock_in_unit) || 0);

  return {
    cartons,
    totalPieces,
  };
};

  const calculateEstimatedTotalPrice = () => {
    const totalPieces = calculateTotalPieces().totalPieces;
    const piecePrice = Number.parseFloat(formData.piece_price) || 0;
    return totalPieces * piecePrice;
  };

  const calculateProfitPerUnit = () => {
    const sellingPrice =
      Number.parseFloat(formData.price || formData.piece_price) || 0;
    const buyingPrice = Number.parseFloat(formData.buying_price) || 0;
    return sellingPrice - buyingPrice;
  };

  const calculateTotalProfit = () => {
    const { totalPieces } = calculateTotalPieces();
    const profitPerUnit = calculateProfitPerUnit();
    const totalStock =
      Number.parseInt(formData.stock) || totalPieces;
    return profitPerUnit * totalStock;
  };

  const calculateProfitMargin = () => {
    const sellingPrice =
      Number.parseFloat(formData.price || formData.piece_price) || 0;
    const buyingPrice = Number.parseFloat(formData.buying_price) || 0;
    if (buyingPrice === 0) return 0;
    return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
  };

  // end here

  const [isUnitSheetOpen, setIsUnitSheetOpen] = useState(false);
  const [inlineEditingUnit, setInlineEditingUnit] = useState<string | null>(
    null
  );
  const [inlineEditData, setInlineEditData] = useState({
    id: "",
    code: "",
    name: "",
  });

  const user: any = jwtDecode(localStorage.getItem("access_token") || "");

  const canEdit = user?.role === "admin";


  const getStockStatus = (quantity: number, lowthreshold:number) => {

    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if ( quantity <= lowthreshold) {
      return { label: "Low Stock", variant: "warning" as const };
    }

    return { label: "In Stock", variant: "default" as const };
  };

const getExpiryStatus = (expiryDate: Date) => {
  const today = new Date();
  // ✅ Default fallback if no setting loaded
  const alertDate = new Date(
    today.getTime() + 1 * 24 * 60 * 60 * 1000
  );

  // Calculate difference in milliseconds
  const diffTime = expiryDate.getTime() - today.getTime();

  // Convert to total days remaining
  let remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Helper: convert total days into years, months, days
  const years = Math.floor(remainingDays / 365);
  remainingDays %= 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;
  
  const formatRemaining = () => {
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (days > 0 || parts.length === 0)
      parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return parts.join(" ");
  };

  if (expiryDate < today) {
    const pastDiff = today.getTime() - expiryDate.getTime();
    let pastDays = Math.ceil(pastDiff / (1000 * 60 * 60 * 24));
    const pastYears = Math.floor(pastDays / 365);
    pastDays %= 365;
    const pastMonths = Math.floor(pastDays / 30);
    pastDays = pastDays % 30;

    const parts: string[] = [];
    if (pastYears > 0) parts.push(`${pastYears} yr${pastYears > 1 ? "s" : ""}`);
    if (pastMonths > 0)
      parts.push(`${pastMonths} month${pastMonths > 1 ? "s" : ""}`);
    if (pastDays > 0 || parts.length === 0)
      parts.push(`${pastDays} day${pastDays !== 1 ? "s" : ""}`);

    return {
      label: "Expired",
      variant: "destructive" as const,
      message: `Expired ${parts.join(" ")} ago`,
    };
  }

  if (expiryDate <= alertDate)
    return {
      label: `Expires in ${formatRemaining()}`,
      variant: "warning" as const,
      message: `Expires in ${formatRemaining()}`,
    };

  return {
    label: `Expires in ${formatRemaining()}`,
    variant: "default" as const,
    message: `Expires in ${formatRemaining()}`,
  };
};


  const resetForm = () => {
    setFormData({
      brand_name: formData.brand_name || "",
      items_name: formData.items_name || "",
      batch_no:  "",
      manufacture_date:  "",
      department: formData.department || "",
      unit_type: formData.unit_type || "Strip" as MedicineUnit,
      company_name: formData.company_name || "",
      piece_price: "",
      buying_price: "",
      low_threshold: formData.low_threshold || "",
      expired_date: formData.expired_date || "",
      price: "",
      stock: "",
      stock_carton: "",
      stock_in_unit: "",
      units_per_carton:"",
      expire_date: formData.expire_date || "",
      unit: formData.unit || "Strip" as MedicineUnit,
      TIN_number: "",
    });
    setEditingMedicine(null);
  };
  const handleResetForm = () => {
    setFormData({
      brand_name: "",
      items_name: "",
      batch_no: "",
      manufacture_date: "",
      department: "",
      unit_type: "Strip" as MedicineUnit,
      company_name: "",
      piece_price: "",
      stock_carton: "",
      stock_in_unit: "",
      low_threshold: "",
      expired_date: "",
      buying_price: "",
      units_per_carton:"",
      price: "",
      stock: "",
      expire_date: "",
      unit: "Strip" as MedicineUnit,
      TIN_number: "",
    });
  };
  const resetUnitForm = () => {
    setUnitFormData({ id: "", code: "", name: "" });
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Required fields for both add and edit
    if (!formData.brand_name.trim()) {
      errors.push("Medicine Name is required");
    }
    if (!formData.batch_no.trim()) {
      errors.push("Batch Number is required");
    }

    if (!formData.expire_date) {
      errors.push("Expiry Date is required");
    }
    if (!formData.unit) {
      errors.push("Unit Type is required");
    }
    if (!formData.department) {
      errors.push("Department is required");
    }
  
    if (
      !formData.buying_price ||
      Number.parseFloat(formData.buying_price) <= 0
    ) {
      errors.push("Buying Price must be greater than 0");
    }
  if (!formData.piece_price || Number.parseFloat(formData.piece_price) <= 0) {
    errors.push("Selling Price must be greater than 0");
  }
    // Date validation
    if (formData.manufacture_date && formData.expire_date) {
      const manufactureDate = new Date(formData.manufacture_date);
      const expiryDate = new Date(formData.expire_date);
      if (manufactureDate >= expiryDate) {
        errors.push("Manufacture Date must be before Expiry Date");
      }
    }

    // Validation for editing
    if (editingMedicine) {
      if (!formData.price || Number.parseFloat(formData.price) <= 0) {
        errors.push("Total Price must be greater than 0");
      }
    } else {
      // Validation for adding
      const {  totalPieces } = calculateTotalPieces();
      const totalStock =
        Number.parseInt(formData.stock) || totalPieces
      if (totalStock <= 0) {
        errors.push(
          "Stock quantity must be greater than 0. Please enter stock manually or provide calculation details."
        );
      }
      if (
        formData.piece_price &&
        Number.parseFloat(formData.piece_price) <= 0
      ) {
        errors.push("Piece Price must be greater than 0 if provided");
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
const { cartons, totalPieces } = calculateTotalPieces();
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join("\n"));
      return;
    }

    if (editingMedicine) {
      try {
        await UpdateMedicine({
          id: editingMedicine.id,
          brand_name: formData.brand_name,
          item_name: formData.items_name,
          batch_no: formData.batch_no,
          ...(formData.manufacture_date && {
            manufacture_date: formData.manufacture_date,
          }
          ),
          company_name: formData.company_name,
          expire_date: formData.expire_date,
          buying_price: Number.parseFloat(formData.buying_price),
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock) || totalPieces,
          department_id: formData.department,
          unit: formData.unit,
          low_threshold: Number.parseInt(formData.low_threshold) || 0,
          expired_date: formData.expired_date ,
          units_per_carton:Number.parseInt(formData.units_per_carton),
          stock_in_unit:Number.parseInt(formData.stock_in_unit) ,
          stock_carton: Number.parseInt(formData.stock_carton) || cartons ,
        }).unwrap();
        toast.success("Medicine updated successfully");
        setIsAddSheetOpen(false);
        refetchMeds();
      } catch (error) {
        console.log(error)
        toast.error("Failed to update medicine");
      }
    } else {
      const newMed = {
        brand_name: formData.brand_name,
        item_name: formData.items_name,
        batch_no: formData.batch_no,
        ...(formData.manufacture_date && {
          manufacture_date: formData.manufacture_date,
        }),
        // manufacture_date: formData.manufacture_date,
        expire_date: formData.expire_date,
        buying_price: Number.parseFloat(formData.buying_price),
        price: Number.parseFloat(formData.piece_price),
        stock: Number.parseInt(formData.stock) || totalPieces,
        low_threshold: Number.parseInt(formData.low_threshold) || 0,
        expired_date: formData.expired_date ,
        department_id: formData.department,
        unit: formData.unit,
        ...(formData.company_name && {
          company_name: formData.company_name
        }
        ),
        units_per_carton:Number.parseInt(formData.units_per_carton),
        stock_in_unit: Number.parseInt(formData.stock_in_unit),
        stock_carton: Number.parseInt(formData.stock_carton) || cartons,
      };
      console.log("med", newMed);
      try {
        await CreateMedicine(newMed).unwrap();
        toast.success("Medicine added successfully");
        refetchMeds();
        resetForm();
      } catch (error) {
        console.log(error);
        toast.error("Failed to add medicine");
      }
    }
    // resetForm();
  };
  
const handleEdit = (medicine: GetMedicine) => {
  try {
    setEditingMedicine(medicine);
    setFormData({
      brand_name: medicine.brand_name || "",
      items_name: medicine.item_name || "",
      batch_no: medicine.batch_no || "",
      manufacture_date: medicine.manufacture_date || "",
      department: medicine.department?.id?.toString() || "",
      company_name: medicine.company_name || "",
      unit_type: (medicine.unit as MedicineUnit) || "Strip",
      piece_price: medicine.price ? String(medicine.price) : "",
      buying_price: medicine.buying_price ? String(medicine.buying_price) : "",
      price: medicine.price ? String(medicine.price) : "",
      stock: medicine.stock ? String(medicine.stock) : "",
      stock_carton: medicine.stock_carton ? String(medicine.stock_carton) : "",
      stock_in_unit: medicine.stock_in_unit
        ? String(medicine.stock_in_unit)
        : "",
      units_per_carton: medicine.units_per_carton
        ? String(medicine.units_per_carton)
        : "",
      expire_date: medicine.expire_date
        ? medicine.expire_date.split("T")[0]
        : "",
      low_threshold: medicine.low_threshold ? String(medicine.low_threshold) : "",
      expired_date: medicine.expired_date ? String(medicine.expired_date) : "",
      
      unit: (medicine.unit as MedicineUnit) || "Strip",
      TIN_number: medicine.TIN_number || "",
    });

    setIsAddSheetOpen(true);
  } catch (err) {
    console.error("Error setting formData:", err);
    // still open the drawer even if some data failed
    setIsAddSheetOpen(true);
  }
};


  const handleDelete = async (medicineCode: string) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await DeleteMedicine(medicineCode).unwrap();
        toast.success("Medicine deleted successfully");
        refetchMeds();
      } catch (error) {
        toast.error("Failed to delete medicine");
      }
    }
  };



  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: Unit = {
      id: unitFormData.id,
      code: unitFormData.code,
      name: unitFormData.name,
    };
    const res = await AddUnit(newCategory).unwrap();
    refetch();
    if (res) {
      toast.success("Unit added successfully");
    }
    setIsAddUnitDialogOpen(false);
    setUnitFormData({ id: "", code: "", name: "" });
  };


const [triggerExport]= useLazyExportExcelQuery()
const handleDownload = async (endpoint: string, baseFilename: string) => {
  const blob = await triggerExport(endpoint).unwrap();
        
  if (!(blob instanceof Blob)) {
    console.error("Expected Blob, got:", typeof(blob));
    return;
  }

  const now = new Date();
  const dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}_${String(
    now.getHours()
  ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
    now.getSeconds()
  ).padStart(2, "0")}`;

  const filename = `${baseFilename}_${dateTime}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};


  const handleUnitChange = (value: string) => {
    // Map "all" back to empty string so it's removed from URL
    setSelectedUnitType(value === "all" ? "" : value);
    setUnit(value === "all" ? "" : value);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-card to-background dark:from-background dark:via-card dark:to-background">
      {/* Header */}
      <div className="fixed top-4 right-4 z-50">
        <NavDropdown />
      </div>
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-md dark:from-primary dark:to-secondary">
        <div className="flex h-16 items-center justify-between px-6 w-full">
          <h1 className="text-lg md:text-2xl font-extrabold text-white tracking-wide">
            Medicine Management
          </h1>

          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 text-white hover:text-gray-200"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div
                className={`absolute md:static top-14 right-0 bg-white md:bg-transparent
              flex flex-col md:flex-row gap-2 p-4 md:p-0 rounded-lg shadow-md
              md:shadow-none transition-all duration-200 z-50
              ${open ? "flex" : "hidden md:flex"}`}
              >
                <Drawer open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                  <DrawerTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medicine
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[95vh]">
                    <div className="mx-auto w-full max-w-7xl overflow-y-auto">
                      <DrawerHeader className="sticky top-0 bg-background z-10 border-b">
                        <DrawerTitle>
                          {editingMedicine
                            ? "Edit Medicine"
                            : "Add New Medicine"}
                        </DrawerTitle>
                        <DrawerDescription>
                          {editingMedicine
                            ? "Update medicine information"
                            : "Enter the details for the new medicine"}
                        </DrawerDescription>
                      </DrawerHeader>
                      <form onSubmit={handleSubmit} className="px-4 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                          {/* Left Column - Main Form Fields */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="brand_name">Brand Name *</Label>
                                <Input
                                  id="brand_name"
                                  value={formData.brand_name}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      brand_name: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="genericName">
                                  Items Name (Optional)
                                </Label>
                                <Input
                                  id="genericName"
                                  value={formData.items_name}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      items_name: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="batchNumber">
                                  Batch Number *
                                </Label>
                                <Input
                                  id="batchNumber"
                                  value={formData.batch_no}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      batch_no: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="company_name">
                                  Company Name
                                </Label>
                                <Input
                                  id="company_name"
                                  value={formData.company_name}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      company_name: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="unit_type">Unit Type *</Label>
                                <Select
                                  value={formData.unit}
                                  onValueChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      unit: value as MedicineUnit,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="border-2 border-primary/30 focus:border-primary">
                                    <SelectValue placeholder="Select unit Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unitTypeOptions.map((unitType) => (
                                      <SelectItem
                                        key={unitType.value}
                                        value={unitType.value}
                                      >
                                        {unitType.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="unit">Department *</Label>
                                <Select
                                  value={formData.department}
                                  onValueChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      department: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="border-2 border-primary/30 focus:border-primary">
                                    <SelectValue placeholder="Select Dept" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UnitsSelection?.results.map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="manufactureDate">
                                  Manufacture Date *
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary",
                                        !formData.manufacture_date &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {formData.manufacture_date ? (
                                        format(
                                          new Date(formData.manufacture_date),
                                          "PPP"
                                        )
                                      ) : (
                                        <span>Pick manufacture date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown"
                                      selected={
                                        formData.manufacture_date
                                          ? new Date(formData.manufacture_date)
                                          : undefined
                                      }
                                      onSelect={(date) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          manufacture_date: date
                                            ? format(date, "yyyy-MM-dd")
                                            : "",
                                        }))
                                      }
                                      disabled={(date) => date > new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">
                                  Expiry Date *
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary",
                                        !formData.expire_date &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {formData.expire_date ? (
                                        format(
                                          new Date(formData.expire_date),
                                          "PPP"
                                        )
                                      ) : (
                                        <span>Pick expiry date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      fromYear={2025}
                                      toYear={2100}
                                      captionLayout="dropdown"
                                      selected={
                                        formData.expire_date
                                          ? new Date(formData.expire_date)
                                          : undefined
                                      }
                                      onSelect={(date) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          expire_date: date
                                            ? format(date, "yyyy-MM-dd")
                                            : "",
                                        }))
                                      }
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="manufactureDate">
                                  Alert Date *
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary",
                                        !formData.expire_date &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {formData.expired_date ? (
                                        format(
                                          new Date(formData.expired_date),
                                          "PPP"
                                        )
                                      ) : (
                                        <span>Pick alert date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      captionLayout="dropdown"
                                      fromYear={2025}
                                      toYear={2100}
                                      selected={
                                        formData.expired_date
                                          ? new Date(formData.expired_date)
                                          : undefined
                                      }
                                      onSelect={(date) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          expired_date: date
                                            ? format(date, "yyyy-MM-dd")
                                            : "",
                                        }))
                                      }
                                      disabled={(date) =>
                                        date >
                                        new Date(
                                          formData.expire_date
                                            ? new Date(formData.expire_date)
                                            : new Date()
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {/* stock in carton */}
                              <div className="space-y-2">
                                <Label htmlFor="stock_in_unit">
                                  Stock In Carton
                                </Label>
                                <Input
                                  id="stock_in_unit"
                                  type="number"
                                  value={Number.parseInt(formData.stock_carton)}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      stock_carton: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  placeholder={
                                    calculateTotalPieces().cartons > 0
                                      ? `Auto: ${
                                          calculateTotalPieces().cartons
                                        }`
                                      : "0"
                                  }
                                />
                              </div>
                              {/* stock per carton */}
                              <div className="space-y-2">
                                <Label htmlFor="units per carton">
                                  {formData.unit} per Carton
                                </Label>
                                <Input
                                  min={0}
                                  id="units_per_carton"
                                  type="number"
                                  value={Number.parseInt(
                                    formData.units_per_carton
                                  )}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      units_per_carton: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  placeholder="0"
                                />
                              </div>
                              {/* stock in unit */}
                              <div className="space-y-2">
                                <Label htmlFor="stockQuantity">
                                  Stock in Unit
                                </Label>
                                <Input
                                  id="stockQuantity"
                                  type="number"
                                  min={0}
                                  placeholder="0"
                                  value={Number.parseInt(
                                    formData.stock_in_unit
                                  )}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      stock_in_unit: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="stockQuantity">
                                  Low Stock no
                                </Label>
                                <Input
                                  id="lowstockThreshold"
                                  type="number"
                                  min={0}
                                  value={Number.parseInt(
                                    formData.low_threshold
                                  )}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      low_threshold: e.target.value,
                                    }))
                                  }
                                  placeholder="0"
                                  className="border-2 border-primary/30 focus:border-primary"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="buying_price">
                                  Buying Price (Birr) *
                                </Label>
                                <Input
                                  id="buying_price"
                                  type="number"
                                  step="0.5"
                                  value={formData.buying_price}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      buying_price: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  placeholder="0.00"
                                  required
                                />
                              </div>
                              {!editingMedicine && (
                                <div className="space-y-2">
                                  <Label htmlFor="piece_price">
                                    Selling Price (Birr) *
                                  </Label>
                                  <Input
                                    id="piece_price"
                                    type="number"
                                    step="0.5"
                                    value={formData.piece_price}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        piece_price: e.target.value,
                                      }))
                                    }
                                    className="border-2 border-primary/30 focus:border-primary"
                                    placeholder="0.00"
                                    required
                                  />
                                </div>
                              )}
                              {editingMedicine && (
                                <div className="space-y-2">
                                  <Label htmlFor="price">
                                    Selling Price (Birr) *
                                  </Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    step="0.5"
                                    value={formData.price}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        price: e.target.value,
                                      }))
                                    }
                                    className="border-2 border-primary/30 focus:border-primary"
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Unified Calculation Card */}
                          <div className="lg:col-span-1">
                            <Card className="border-2 border-primary/30 sticky top-20">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Package className="h-5 w-5" />
                                  Calculations
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Quantity Calculation Inputs */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-muted-foreground">
                                    Quantity Details
                                  </h4>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="number_of_cartons"
                                      className="text-xs"
                                    >
                                      Cartons
                                    </Label>
                                    <Input
                                      id="number_of_cartons"
                                      type="number"
                                      value={formData.stock_carton}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          stock_carton: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-2 border-primary/30 focus:border-primary"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="units_per_carton"
                                      className="text-xs"
                                    >
                                      {formData.unit}/Carton
                                    </Label>
                                    <Input
                                      id="units_per_carton"
                                      type="number"
                                      value={formData.units_per_carton}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          units_per_carton: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-2 border-primary/30 focus:border-primary"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>

                                {/* Results Section */}
                                <div className="space-y-2 pt-2 border-t">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      Total Pieces:
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                      {calculateTotalPieces().totalPieces}
                                    </span>
                                  </div>

                                  {calculateTotalPieces().totalPieces > 0 &&
                                    formData.piece_price && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">
                                          Est. Total Price:
                                        </span>
                                        <span className="text-sm font-semibold text-foreground">
                                          Birr{" "}
                                          {calculateEstimatedTotalPrice().toFixed(
                                            2
                                          )}
                                        </span>
                                      </div>
                                    )}

                                  {formData.buying_price &&
                                    (formData.price ||
                                      formData.piece_price) && (
                                      <>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                          <span className="text-xs text-muted-foreground">
                                            Profit/Unit:
                                          </span>
                                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            Birr{" "}
                                            {calculateProfitPerUnit().toFixed(
                                              2
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-muted-foreground">
                                            Total Profit:
                                          </span>
                                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            Birr{" "}
                                            {calculateTotalProfit().toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-muted-foreground">
                                            Margin:
                                          </span>
                                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {calculateProfitMargin().toFixed(1)}
                                            %
                                          </span>
                                        </div>
                                      </>
                                    )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end mt-6 pt-4 border-t sticky bottom-0 bg-background pb-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleResetForm}
                          >
                            Reset Form
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddSheetOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isCreating}>
                            {editingMedicine
                              ? "Update Medicine"
                              : "Add Medicine"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </DrawerContent>
                </Drawer>

                <Sheet open={isUnitSheetOpen} onOpenChange={setIsUnitSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">View Department</Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full sm:w-[540px] max-w-full sm:max-w-[540px]"
                  >
                    <SheetHeader>
                      <SheetTitle>Department Management</SheetTitle>
                      <SheetDescription>
                        View and manage Departments for medicines
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Units?.results.map((unit) => (
                            <TableRow key={unit.id}>
                              <TableCell className="font-mono">
                                {unit.code}
                              </TableCell>
                              <TableCell>
                                {inlineEditingUnit === unit.id ? (
                                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <Input
                                      value={inlineEditData.code}
                                      onChange={(e) =>
                                        setInlineEditData((prev) => ({
                                          ...prev,
                                          code: e.target.value,
                                        }))
                                      }
                                      placeholder="Code"
                                      className="w-full sm:w-24 border-2 border-primary/30 focus:border-primary"
                                    />
                                    <Input
                                      value={inlineEditData.name}
                                      onChange={(e) =>
                                        setInlineEditData((prev) => ({
                                          ...prev,
                                          name: e.target.value,
                                        }))
                                      }
                                      placeholder="Name"
                                      className="flex-1 border-2 border-primary/30 focus:border-primary"
                                    />
                                    <div className="flex gap-2 justify-end sm:justify-start">
                                      <Button
                                        className="bg-primary hover:bg-primary/80 text-white"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            await UpdateUnit(
                                              inlineEditData
                                            ).unwrap();
                                            setInlineEditingUnit(null);
                                            setInlineEditData({
                                              id: "",
                                              code: "",
                                              name: "",
                                            });
                                            refetch();
                                            toast.success(
                                              "Unit updated successfully"
                                            );
                                          } catch (error) {
                                            toast.error(
                                              "Failed to update unit"
                                            );
                                          }
                                        }}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        className="bg-warning hover:bg-warning/80 text-white"
                                        size="sm"
                                        onClick={() => {
                                          setInlineEditingUnit(null);
                                          setInlineEditData({
                                            id: "",
                                            code: "",
                                            name: "",
                                          });
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center flex-wrap gap-2">
                                    <div>{unit.name}</div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setInlineEditingUnit(unit.id);
                                          setInlineEditData({
                                            id: unit.id,
                                            code: unit.code,
                                            name: unit.name,
                                          });
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          toast.custom(
                                            (t) => (
                                              <div className="bg-background  text-foreground border rounded-lg p-4 shadow-md flex flex-col gap-2 w-64">
                                                <p className="text-sm">
                                                  Are you sure you want to
                                                  delete <b>{unit.name}</b>?
                                                </p>
                                                <div className="flex justify-end gap-2">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                      toast.dismiss(t)
                                                    }
                                                  >
                                                    Cancel
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                      try {
                                                        await DeleteUnit(
                                                          unit.id
                                                        ).unwrap();
                                                        toast.success(
                                                          "Unit deleted successfully"
                                                        );
                                                        refetch();
                                                        toast.dismiss(t);
                                                      } catch (error) {
                                                        toast.error(
                                                          "Failed to delete unit"
                                                        );
                                                      } finally {
                                                        toast.dismiss(t);
                                                      }
                                                    }}
                                                  >
                                                    Delete
                                                  </Button>
                                                </div>
                                              </div>
                                            ),
                                            { duration: 20000 }
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Pagination
                        currentPage={unitCurrentPage}
                        totalPages={Units?.pagination.totalPages || 1}
                        itemsPerPage={unitItemsPerPage}
                        onPageChange={setUnitCurrentPage}
                        onItemsPerPageChange={setUnitItemsPerPage}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Dialog
                  open={isAddUnitDialogOpen}
                  onOpenChange={setIsAddUnitDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={resetUnitForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new Department
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUnitSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="unitName">Department Code *</Label>
                          <Input
                            id="UnitCode"
                            value={unitFormData.code}
                            onChange={(e) =>
                              setUnitFormData((prev) => ({
                                ...prev,
                                code: e.target.value,
                              }))
                            }
                            placeholder="Enter Department Code"
                            className="border-2 border-primary/30 focus:border-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unitName">Department Name *</Label>
                          <Input
                            id="unitName"
                            value={unitFormData.name}
                            onChange={(e) =>
                              setUnitFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter Department name"
                            className="border-2 border-primary/30 focus:border-primary"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddUnitDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUnitAdding}>
                          Add Unit
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() =>
                    handleDownload(
                      "/pharmacy/medicines/export-excel/",
                      "medicines.xlsx"
                    )
                  }
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-8xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search by Batch Number..."
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="pl-12 h-12 border-2 border-primary/30 focus:border-primary"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search medicines..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-12 h-12 border-2 border-primary/30 focus:border-primary"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-primary/30 focus:border-primary">
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {UnitsSelection?.results.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedUnitType} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-primary/30 focus:border-primary">
              <SelectValue placeholder="All Unit Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Unit Types</SelectItem>
              {unitTypeOptions.map((unitType) => (
                <SelectItem key={unitType.value} value={unitType.value}>
                  {unitType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alerts */}
        {/* <div className="space-y-6 mb-8">
          {meds?.results &&
            meds.results.filter(
              (med) => med.total_stock_units < med.low_threshold
            ).length > 0 && (
              <Alert className="border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDescription className="text-destructive dark:text-destructive">
                  {meds.results.filter((med) => med.stock < 10).length}{" "}
                  medicines have low stock (below 10 units).
                </AlertDescription>
              </Alert>
            )}
          {meds?.results &&
            meds.results.filter((med) => {
              const today = new Date();
              const thirtyDaysFromNow = new Date(
                today.getTime() + 30 * 24 * 60 * 60 * 1000
              );
              const expireDate = new Date(med.expire_date);
              return expireDate <= thirtyDaysFromNow;
            }).length > 0 && (
              <Alert className="border-warning/20 bg-warning/5 dark:border-warning/40 dark:bg-warning/10">
                <Calendar1Icon className="h-5 w-5 text-warning" />
                <AlertDescription className="text-warning dark:text-warning">
                  {
                    meds.results.filter((med) => {
                      const today = new Date();
                      const thirtyDaysFromNow = new Date(
                        today.getTime() +30 * 24 * 60 * 60 * 1000
                      );
                      const expireDate = new Date(med.expire_date);
                      return expireDate <= thirtyDaysFromNow;
                    }).length
                  }{" "}
                  medicines are expiring within 30 days
                </AlertDescription>
              </Alert>
            )}
        </div> */}

        {/* Medicine Table */}
        <Card className="shadow-xl border-border">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/50 dark:to-muted/30">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Package className="h-6 w-6" />
              Medicine Inventory ({meds?.pagination.totalItems || 0})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your medicine inventory and track stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Image</TableHead>
                    <TableHead className="text-foreground">Medicine</TableHead>

                    {canEdit && (
                      <TableHead className="text-foreground">Code No</TableHead>
                    )}
                    <TableHead className="text-foreground">
                      Department
                    </TableHead>
                    <TableHead className="text-foreground">Unit Type</TableHead>
                    {canEdit && (
                      <TableHead className="text-foreground">
                        Company Name
                      </TableHead>
                    )}
                    <TableHead className="text-foreground">Batch</TableHead>
                    {canEdit && (
                      <>
                        <TableHead className="text-foreground">
                          Buying Price
                        </TableHead>
                        <TableHead className="text-foreground">
                          Profit/Unit
                        </TableHead>
                        <TableHead className="text-foreground">
                          Total Profit
                        </TableHead>
                      </>
                    )}
                    <TableHead className="text-foreground">
                      Selling Price
                    </TableHead>

                    <TableHead className="text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground">Expiry</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    {canEdit && (
                      <TableHead className="text-foreground">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meds?.results.map((medicine) => {
                    const stockStatus = getStockStatus(
                      medicine.total_stock_units,
                      medicine.low_threshold
                    );
                    const expiryStatus = getExpiryStatus(
                      new Date(medicine.expire_date)
                    );

                    return (
                      <TableRow key={medicine.id} className="hover:bg-muted/50">
                        {" "}
                        <TableCell>
                          {medicine.attachment ? (
                            <img
                              src={medicine.attachment || "/placeholder.svg"}
                              alt={medicine.brand_name}
                              className="w-12 h-12 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-foreground">
                              {medicine.item_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Brand: {medicine.brand_name}
                            </div>
                          </div>
                        </TableCell>
                        {canEdit && (
                          <TableCell className="font-mono text-sm text-foreground">
                            {medicine.department?.code || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="text-foreground">
                          {medicine.department?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {medicine.unit || "N/A"}
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-foreground">
                            {medicine.company_name || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {medicine.batch_no}
                        </TableCell>
                        {canEdit && (
                          <>
                            <TableCell className="font-semibold text-foreground">
                              Birr{" "}
                              {Number.parseFloat(
                                medicine.buying_price || "0"
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600 dark:text-green-400">
                              Birr{" "}
                              {medicine.profit_per_item?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                              Birr {medicine.total_profit?.toFixed(2) || "0.00"}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="font-semibold text-foreground">
                          Birr {Number.parseFloat(medicine.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={stockStatus.variant}
                            className="font-medium space-x-1"
                          >
                            <span>{stockStatus.label}</span>
                            <span>
                              ({medicine.total_stock_units} {medicine.unit})
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {new Date(
                              medicine.expire_date
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={expiryStatus.variant}
                            className="font-medium"
                          >
                            {expiryStatus.label}
                          </Badge>
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(medicine)}
                                className="hover:bg-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(medicine.id)}
                                className="hover:bg-destructive/50 dark:hover:bg-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={meds?.pagination.totalPages || 1}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
