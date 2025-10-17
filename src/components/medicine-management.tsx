
import type React from "react";
import { useState, useMemo } from "react";

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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  AlertTriangle,
  Calendar,
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
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    number_of_cartons: "",
    items_per_carton: "",
    piece_price: "",
    buying_price: "",
    price: "",
    stock:"",
    stock_carton: "",
    stock_in_unit: "",
    units_per_carton:"",
    expire_date: "",
    unit: "Strip" as MedicineUnit,
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
  const { data: meds, refetch: refetchMeds } = useGetMedicinesQuery(
    {
      pageNumber: currentPage,
      pageSize: itemsPerPage,
      unit,
      batch_no: batchNo,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const {data:settings}= useGetSettingsQuery()
  const [AddUnit, { isLoading: isUnitAdding }] = useCreateUnitMutation();
  const [UpdateUnit] = useUpdateUnitMutation();
  const [DeleteUnit] = useDeleteUnitMutation();
  const [CreateMedicine, { isLoading: isCreating }] =
    useCreateMedicineMutation();
  const [UpdateMedicine] = useUpdateMedicineMutation();
  const [DeleteMedicine] = useDeleteMedicineMutation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    { value: "10x100", label: "10 x 100" },
    { value: "Of10", label: "Of 10" },
    { value: "Of20", label: "Of 20" },
    { value: "Of14", label: "Of 14" },
    { value: "Of28", label: "Of 28" },
    { value: "Of30", label: "Of 30" },
    { value: "Suppository", label: "Suppository" },
    { value: "Pcs", label: "Pcs" },
    { value: "Tablet", label: "Tablet" },
    { value: "Pk", label: "PK" },
  ];

  // stock calculation start here
const calculateTotalPieces = () => {
  const cartons = Number.parseInt(formData.stock_carton) || 0;
  const itemsPerCarton = Number.parseInt(formData.stock_in_unit) || 0;
  const totalPieces = cartons * itemsPerCarton;

  return {
    cartons,
    totalPieces,
  };
};

  const calculateEstimatedTotalPrice = () => {
    calculateTotalPieces().totalPieces
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

  const filteredMedicines = useMemo(() => {
    return (
      meds?.results?.filter((medicine) => {
        const matchesSearch =
          medicine.brand_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.item_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.company_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) 

        const matchesCategory =
          selectedCategory === "all" ||
          medicine.department.id.toString() === selectedCategory;

        return matchesSearch && matchesCategory;
      }) || []
    );
  }, [meds, searchTerm, selectedCategory, selectedUnitType]);

  const getStockStatus = (quantity: number) => {

    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (settings && quantity <= settings.low_stock_threshold) {
      return { label: "Low Stock", variant: "warning" as const };
    }

    return { label: "In Stock", variant: "default" as const };
  };

const getExpiryStatus = (expiryDate: Date) => {
  const today = new Date();

  // ✅ Fallback to 30 days if settings aren’t loaded yet
  const expiryDays = settings?.expired_date ?? 20;
console.log(expiryDays)
  const alertDate = new Date(
    today.getTime() + expiryDays * 24 * 60 * 60 * 1000
  );
  console.log("alertdate", alertDate)
  const diffTime = expiryDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  console.log("diff", diffTime, remainingDays);

  if (expiryDate < today)
    return {
      label: "Expired",
      variant: "destructive" as const,
      message: `Expired ${Math.abs(remainingDays)} day${
        Math.abs(remainingDays) !== 1 ? "s" : ""
      } ago`,
    };

  if (expiryDate <= alertDate)
    return {
      label: `Expires in ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`,
      variant: "warning" as const,
      message: `Expires in ${remainingDays} day${
        remainingDays !== 1 ? "s" : ""
      }`,
    };

  return {
    label: "Valid",
    variant: "default" as const,
    message: `Expires in ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`,
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
      number_of_cartons: formData.number_of_cartons || "",
      company_name: formData.company_name || "",
      items_per_carton: formData.items_per_carton ||  "",
      piece_price: "",
      buying_price: "",
      price: "",
      stock: "",
      stock_carton: "",
      stock_in_unit: "",
      units_per_carton:"",
      expire_date: formData.expire_date || "",
      unit: formData.unit || "Strip" as MedicineUnit,
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
      number_of_cartons: "",
      company_name: "",
      items_per_carton: "",
      piece_price: "",
      stock_carton: "",
      stock_in_unit: "",
      buying_price: "",
      units_per_carton:"",
      price: "",
      stock: "",
      expire_date: "",
      unit: "Strip" as MedicineUnit,
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
          manufacture_date: formData.manufacture_date,
          company_name: formData.company_name,
          expire_date: formData.expire_date,
          buying_price: Number.parseFloat(formData.buying_price),
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock) || totalPieces,
          department_id: formData.department,
          unit: formData.unit,
          units_per_carton:Number.parseInt(formData.units_per_carton),
          stock_in_unit:
            Number.parseInt(formData.stock) || totalPieces,
          stock_carton: Number.parseInt(formData.stock_carton) || cartons ,
        }).unwrap();
        toast.success("Medicine updated successfully");
        setIsAddSheetOpen(false);
        refetchMeds();
      } catch (error) {
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
        department_id: formData.department,
        unit: formData.unit,
        ...(formData.company_name && {
          company_name: formData.company_name
        }
        ),
        units_per_carton:Number.parseInt(formData.units_per_carton),
        stock_in_unit: Number.parseInt(formData.stock) || totalPieces,
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
    setEditingMedicine(medicine);
    setFormData({
      brand_name: medicine.brand_name,
      items_name: medicine.item_name || "",
      batch_no: medicine.batch_no,
      manufacture_date: medicine.manufacture_date,
      department: medicine.department.id.toString(),
      unit_type: (medicine.unit as MedicineUnit) || "Strip",
      company_name: medicine.company_name || "",
      number_of_cartons: medicine.stock_carton?.toString() || "",
      items_per_carton: medicine.stock_in_unit?.toString() || "",
      piece_price: medicine.price?.toString() || "",
      buying_price: medicine.buying_price?.toString() || "",
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      expire_date: medicine.expire_date.split("T")[0],
      unit: medicine.unit as MedicineUnit,
      units_per_carton:medicine.units_per_carton.toString(),
      stock_carton: medicine.stock_carton.toString(),
      stock_in_unit: medicine.stock_in_unit.toString(),
    });
    setIsAddSheetOpen(true);
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

  const getCategoryName = (categoryId: string) => {
    return (
      Units?.results.find((unit) => unit.id === categoryId)?.name || "Unknown"
    );
  };

  const handleExport = () => {
    const data = filteredMedicines.map((med) => ({
      "Medicine Name": med.brand_name,
      "Items Name": med.item_name || "",
      Unit: getCategoryName(med.department.id.toString()),
      "Company Name": med.company_name || "",
      Batch: med.batch_no,
      Price: med.price.toString(),
      Stock: med.stock.toString(),
      "Expiry Date": new Date(med.expire_date).toLocaleDateString(),
      Status: getExpiryStatus(new Date(med.expire_date)).label,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Medicines");
    XLSX.writeFile(wb, "medicines.xlsx");
  };
  const handleUnitChange = (value: string) => {
    // Map "all" back to empty string so it's removed from URL
    setSelectedUnitType(value === "all" ? "" : value);
    setUnit(value === "all" ? "" : value);
  };
  const { totalPieces } = calculateTotalPieces();
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-card to-background dark:from-background dark:via-card dark:to-background">
      {/* Header */}
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
                                    {Units?.results.map((category) => (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <CalendarComponent
                                      mode="single"
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
                                    <CalendarComponent
                                      mode="single"
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="stock_in_unit">
                                   {formData.unit} In Carton
                                </Label>
                                <Input
                                  id="stock_in_unit"
                                  type="number"
                                  value={formData.stock_carton}
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
                               <div className="space-y-2">
                                <Label htmlFor="units per carton">
                                  {formData.unit}  per Carton
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
                              <div className="space-y-2">
                                <Label htmlFor="stockQuantity">
                                  Stock in Unit
                                </Label>
                                <Input
                                  id="stockQuantity"
                                  type="number"
                                  value={formData.stock_in_unit}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      stock_in_unit: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  placeholder={
                                    calculateTotalPieces().totalPieces > 0
                                      ? `Auto: ${
                                          calculateTotalPieces().totalPieces
                                        }`
                                      : "0"
                                  }
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
                                      htmlFor="stock_in_unit"
                                      className="text-xs"
                                    >
                                      {formData.unit}/Carton
                                    </Label>
                                    <Input
                                      id="stock_in_unit"
                                      type="number"
                                      value={formData.stock_in_unit}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          stock_in_unit: e.target.value,
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
                <Button onClick={handleExport} variant="outline">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-primary/30 focus:border-primary"
            />
          </div>

      
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-56 h-12 border-2 border-primary/30 focus:border-primary">
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {Units?.results.map((category) => (
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
        <div className="space-y-6 mb-8">
          {meds?.results &&
            meds.results.filter((med) => med.stock < 10).length > 0 && (
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
                <Calendar className="h-5 w-5 text-warning" />
                <AlertDescription className="text-warning dark:text-warning">
                  {
                    meds.results.filter((med) => {
                      const today = new Date();
                      const thirtyDaysFromNow = new Date(
                        today.getTime() + 30 * 24 * 60 * 60 * 1000
                      );
                      const expireDate = new Date(med.expire_date);
                      return expireDate <= thirtyDaysFromNow;
                    }).length
                  }{" "}
                  medicines are expiring within 30 days
                </AlertDescription>
              </Alert>
            )}
        </div>

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
                    <TableHead className="text-foreground">Medicine</TableHead>
                    <TableHead className="text-foreground">Image</TableHead>
                    <TableHead className="text-foreground">Code No</TableHead>
                    <TableHead className="text-foreground">
                      Department
                    </TableHead>
                    <TableHead className="text-foreground">Unit Type</TableHead>
                    <TableHead className="text-foreground">
                      Company Name
                    </TableHead>
                    <TableHead className="text-foreground">Batch</TableHead>
                    <TableHead className="text-foreground">
                      Buying Price
                    </TableHead>
                    <TableHead className="text-foreground">
                      Selling Price
                    </TableHead>
                    <TableHead className="text-foreground">
                      Profit/Unit
                    </TableHead>
                    <TableHead className="text-foreground">
                      Total Profit
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
                  {filteredMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stock);
                    const expiryStatus = getExpiryStatus(
                      new Date(medicine.expire_date)
                    );

                    return (
                      <TableRow key={medicine.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-foreground">
                              {medicine.brand_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {medicine.item_name}
                            </div>
                          </div>
                        </TableCell>
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
                        <TableCell className="font-mono text-sm text-foreground">
                          {medicine.department?.code || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {medicine.department?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {medicine.unit || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {medicine.company_name || "N/A"}
                        </TableCell>

                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {medicine.batch_no}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          Birr{" "}
                          {Number.parseFloat(
                            medicine.buying_price || "0"
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          Birr {Number.parseFloat(medicine.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          Birr {medicine.profit_per_item?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                          Birr {medicine.total_profit?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={stockStatus.variant}
                            className="font-medium"
                          >
                            {medicine.stock} units
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
