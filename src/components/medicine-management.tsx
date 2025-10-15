"use client";

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
  RefreshCw,
  History,
  Download,
  X,
  Menu,
  CalendarIcon,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jwtDecode } from "jwt-decode";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
  useUpdateUnitMutation,
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
import { useCreateRefillMutation, useGetRefillsQuery } from "@/store/refillApi";

import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";

export function MedicineManagement() {
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    unit,
    setUnit,
  } = useQueryParamsState();

  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [unitItemsPerPage, setUnitItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    brand_name: "",
    generic_name: "",
    batch_no: "",
    manufacture_date: "",
    department: "",
    company_name: "",
    FSNO: "",
    unit_type: "Strip" as MedicineUnit,
    number_of_boxes: "",
    strips_per_box: "",
    pieces_per_strip: "",
    piece_price: "",
    buying_price: "",
    price: "",
    stock: "",
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
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: refills, refetch: refetchRefills } = useGetRefillsQuery();
  const [AddUnit, { isLoading: isUnitAdding }] = useCreateUnitMutation();
  const [UpdateUnit] = useUpdateUnitMutation();
  const [DeleteUnit] = useDeleteUnitMutation();
  const [CreateMedicine, { isLoading: isCreating }] =
    useCreateMedicineMutation();
  const [UpdateMedicine] = useUpdateMedicineMutation();
  const [DeleteMedicine] = useDeleteMedicineMutation();
  const [createRefill, { isLoading: isRefilling }] = useCreateRefillMutation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUnitType, setSelectedUnitType] = useState<string>("all");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<GetMedicine | null>(
    null
  );
  const [isRefillDialogOpen, setIsRefillDialogOpen] = useState(false);
  const [refillingMedicine, setRefillingMedicine] =
    useState<GetMedicine | null>(null);
  const [refillFormData, setRefillFormData] = useState({
    quantity: "",
    refill_date: new Date().toISOString().split("T")[0],
    end_date: "",
    batch_no: "",
    medicine: "",
    department: "",
    manufacture_date: "",
    company_name: "",
    FSNO: "",
    expire_date: "",
    price: "",
    number_of_boxes: "",
    strips_per_box: "",
    pieces_per_strip: "",
  });
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyMedicine, setHistoryMedicine] = useState<GetMedicine | null>(
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
    { value: "PK", label: "PK" },
  ];
  const calculateTotalPieces = () => {
    const boxes = Number.parseInt(formData.number_of_boxes) || 0;
    const strips = Number.parseInt(formData.strips_per_box) || 0;
    const pieces = Number.parseInt(formData.pieces_per_strip) || 0;
    return boxes * strips * pieces;
  };

  const calculateEstimatedTotalPrice = () => {
    const totalPieces = calculateTotalPieces();
    const piecePrice = Number.parseFloat(formData.piece_price) || 0;
    return totalPieces * piecePrice;
  };

  const calculateRefillTotalPieces = () => {
    const boxes = Number.parseInt(refillFormData.number_of_boxes) || 0;
    const strips = Number.parseInt(refillFormData.strips_per_box) || 0;
    const pieces = Number.parseInt(refillFormData.pieces_per_strip) || 0;
    return boxes * strips * pieces;
  };

  const calculateProfitPerUnit = () => {
    const sellingPrice =
      Number.parseFloat(formData.price || formData.piece_price) || 0;
    const buyingPrice = Number.parseFloat(formData.buying_price) || 0;
    return sellingPrice - buyingPrice;
  };

  const calculateTotalProfit = () => {
    const profitPerUnit = calculateProfitPerUnit();
    const totalStock =
      Number.parseInt(formData.stock) || calculateTotalPieces();
    return profitPerUnit * totalStock;
  };

  const calculateProfitMargin = () => {
    const sellingPrice =
      Number.parseFloat(formData.price || formData.piece_price) || 0;
    const buyingPrice = Number.parseFloat(formData.buying_price) || 0;
    if (buyingPrice === 0) return 0;
    return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
  };

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
          medicine.generic_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.company_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          medicine.FSNO?.toLowerCase().includes(searchTerm.toLowerCase());

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
    if (quantity < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (expiryDate < today)
      return { label: "Expired", variant: "destructive" as const };
    if (expiryDate <= thirtyDaysFromNow)
      return { label: "Near Expiry", variant: "secondary" as const };
    return { label: "Valid", variant: "default" as const };
  };

  const resetForm = () => {
    setFormData({
      brand_name: formData.brand_name || "",
      generic_name: formData.generic_name || "",
      batch_no: formData.batch_no || "",
      manufacture_date: formData.manufacture_date || "",
      department: formData.department || "",
      unit_type: "Strip" as MedicineUnit,
      number_of_boxes: "",
      company_name: "",
      FSNO: "",
      strips_per_box: "",
      pieces_per_strip: "",
      piece_price: "",
      buying_price: "",
      price: "",
      stock: "",
      expire_date: formData.expire_date || "",
      unit: "Strip" as MedicineUnit,
    });
    setEditingMedicine(null);
  };
  const handleResetForm = () => {
    setFormData({
      brand_name: "",
      generic_name: "",
      batch_no: "",
      manufacture_date: "",
      department: "",
      unit_type: "Strip" as MedicineUnit,
      number_of_boxes: "",
      company_name: "",
      FSNO: "",
      strips_per_box: "",
      pieces_per_strip: "",
      piece_price: "",
      buying_price: "",
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
    if (!formData.manufacture_date) {
      errors.push("Manufacture Date is required");
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
    if (!formData.company_name) {
      errors.push("Company name is required");
    }
    if (!formData.FSNO) {
      errors.push("FS.NO  is required");
    }
    if (
      !formData.buying_price ||
      Number.parseFloat(formData.buying_price) <= 0
    ) {
      errors.push("Buying Price must be greater than 0");
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
      const totalStock =
        Number.parseInt(formData.stock) || calculateTotalPieces();
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
          generic_name: formData.generic_name,
          batch_no: formData.batch_no,
          manufacture_date: formData.manufacture_date,
          company_name: formData.company_name,
          FSNO: formData.FSNO,
          expire_date: formData.expire_date,
          buying_price: formData.buying_price,
          price: formData.price,
          stock: Number.parseInt(formData.stock) || calculateTotalPieces(),
          department_id: formData.department,
          unit: formData.unit,
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
        generic_name: formData.generic_name,
        batch_no: formData.batch_no,
        manufacture_date: formData.manufacture_date,
        expire_date: formData.expire_date,
        buying_price: formData.buying_price,
        price: formData.piece_price,
        stock: Number.parseInt(formData.stock) || calculateTotalPieces(),
        department_id: formData.department,
        unit: formData.unit,
        company_name: formData.company_name,
        FSNO: formData.FSNO,
      };
    console.log("med", newMed)
      try {
        await CreateMedicine(newMed).unwrap();
        toast.success("Medicine added successfully");
        refetchMeds();
      } catch (error) {
        toast.error("Failed to add medicine");
      }
    }
    // resetForm();
  };
 
  const handleEdit = (medicine: GetMedicine) => {
    setEditingMedicine(medicine);
    setFormData({
      brand_name: medicine.brand_name,
      generic_name: medicine.generic_name || "",
      batch_no: medicine.batch_no,
      manufacture_date: medicine.manufacture_date,
      department: medicine.department.id.toString(),
      unit_type: (medicine.unit_type as MedicineUnit) || "Strip",
      company_name: medicine.company_name || "",
      FSNO: medicine.FSNO || "",
      number_of_boxes: medicine.number_of_boxes?.toString() || "",
      strips_per_box: medicine.strips_per_box?.toString() || "",
      pieces_per_strip: medicine.pieces_per_strip?.toString() || "",
      piece_price: medicine.price?.toString() || "",
      buying_price: medicine.buying_price?.toString() || "",
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      expire_date: medicine.expire_date.split("T")[0],
      unit: medicine.unit as MedicineUnit,
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

  const handleRefill = (medicine: GetMedicine) => {
    setRefillingMedicine(medicine);
    setRefillFormData({
      quantity: "",
      refill_date: new Date().toISOString().split("T")[0],
      end_date: "",
      batch_no: "",
      medicine: medicine.id,
      department: medicine.department.id,
      manufacture_date: "",
      company_name: medicine.company_name || "",
      FSNO: medicine.FSNO || "",
      expire_date: "",
      price: medicine.price,
      number_of_boxes: "",
      strips_per_box: "",
      pieces_per_strip: "",
    });
    setIsRefillDialogOpen(true);
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillingMedicine) return;
    try {
      let quantityToAdd = Number.parseInt(refillFormData.quantity);
      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        // If quantity is empty or invalid, use the calculated total pieces
        quantityToAdd = calculateRefillTotalPieces();
        if (quantityToAdd <= 0) {
          toast.error("Please enter a quantity or provide calculation details");
          return;
        }
      }

      await createRefill({
        code_no: refillingMedicine.code_no,
        medicine: refillFormData.medicine,
        quantity: quantityToAdd,
        batch_no: refillFormData.batch_no,
        department: refillFormData.department,

        manufacture_date: refillFormData.manufacture_date,
        expire_date: refillFormData.expire_date,
        price: refillFormData.price,
      }).unwrap();

      refetchRefills();
      refetchMeds();
      toast.success("Refill added successfully");
      setIsRefillDialogOpen(false);
      setRefillingMedicine(null);
    } catch (error) {
      toast.error("Failed to add refill");
    }
  };

  const handleHistory = (medicine: GetMedicine) => {
    setHistoryMedicine(medicine);
    setIsHistoryDialogOpen(true);
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
      "Generic Name": med.generic_name || "",
      Unit: getCategoryName(med.department.id.toString()),
      "Company Name": med.company_name || "",
      FSNO: med.FSNO || "",
      Batch: med.batch_no,
      Price: med.price.toString(),

      Stock: med.stock.toString(),
      "Expiry Date": new Date(med.expire_date).toLocaleDateString(),
      Status: getExpiryStatus(new Date(med.expire_date)).label,
      Refills: med.refill_count?.toString() || "0",
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
                                <Label htmlFor="brand_name">
                                  Brand Name *
                                </Label>
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
                                  Generic Name (Optional)
                                </Label>
                                <Input
                                  id="genericName"
                                  value={formData.generic_name}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      generic_name: e.target.value,
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
                                <Label htmlFor="stockQuantity">
                                  Stock (or use calculation)
                                </Label>
                                <Input
                                  id="stockQuantity"
                                  type="number"
                                  value={formData.stock}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      stock: e.target.value,
                                    }))
                                  }
                                  className="border-2 border-primary/30 focus:border-primary"
                                  placeholder={
                                    calculateTotalPieces() > 0
                                      ? `Auto: ${calculateTotalPieces()}`
                                      : "0"
                                  }
                                />
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
                              <div className="space-y-2">
                                <Label htmlFor="FSNO">FSNO</Label>
                                <Input
                                  id="FSNO"
                                  value={formData.FSNO}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      FSNO: e.target.value,
                                    }))
                                  }
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
                                  step="0.01"
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
                                    step="0.01"
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
                                    step="0.01"
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
                                      htmlFor="number_of_boxes"
                                      className="text-xs"
                                    >
                                      Boxes
                                    </Label>
                                    <Input
                                      id="number_of_boxes"
                                      type="number"
                                      value={formData.number_of_boxes}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          number_of_boxes: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-2 border-primary/30 focus:border-primary"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="strips_per_box"
                                      className="text-xs"
                                    >
                                      Strips/Box
                                    </Label>
                                    <Input
                                      id="strips_per_box"
                                      type="number"
                                      value={formData.strips_per_box}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          strips_per_box: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-2 border-primary/30 focus:border-primary"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="pieces_per_strip"
                                      className="text-xs"
                                    >
                                      Pieces/Strip
                                    </Label>
                                    <Input
                                      id="pieces_per_strip"
                                      type="number"
                                      value={formData.pieces_per_strip}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          pieces_per_strip: e.target.value,
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
                                      {calculateTotalPieces()}
                                    </span>
                                  </div>

                                  {calculateTotalPieces() > 0 &&
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

                {/* Refill Dialog */}
                <Dialog
                  open={isRefillDialogOpen}
                  onOpenChange={setIsRefillDialogOpen}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Refill Medicine</DialogTitle>
                      <DialogDescription>
                        Add stock to {refillingMedicine?.brand_name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRefillSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">
                            Quantity to Add (or use calculation below)
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={refillFormData.quantity}
                            onChange={(e) =>
                              setRefillFormData((prev) => ({
                                ...prev,
                                quantity: e.target.value,
                              }))
                            }
                            className="border-2 border-primary/30 focus:border-primary"
                            placeholder={
                              calculateRefillTotalPieces() > 0
                                ? `Auto: ${calculateRefillTotalPieces()}`
                                : "0"
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="manufacture_date">
                            Manufacture Date *
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary",
                                  !refillFormData.manufacture_date &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {refillFormData.manufacture_date ? (
                                  format(
                                    new Date(refillFormData.manufacture_date),
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
                                  refillFormData.manufacture_date
                                    ? new Date(refillFormData.manufacture_date)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setRefillFormData((prev) => ({
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
                          <Label htmlFor="expire_date">
                            Expire Date (Optional)
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary",
                                  !refillFormData.expire_date &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {refillFormData.expire_date ? (
                                  format(
                                    new Date(refillFormData.expire_date),
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
                                  refillFormData.expire_date
                                    ? new Date(refillFormData.expire_date)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setRefillFormData((prev) => ({
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
                          <Label htmlFor="price">Price (Birr) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="1.00"
                            value={refillFormData.price}
                            onChange={(e) =>
                              setRefillFormData((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            className="border-2 border-primary/30 focus:border-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batch_number">Batch Number *</Label>
                          <Input
                            id="batch_no"
                            value={refillFormData.batch_no}
                            onChange={(e) =>
                              setRefillFormData((prev) => ({
                                ...prev,
                                batch_no: e.target.value,
                              }))
                            }
                            placeholder="Enter batch number"
                            className="border-2 border-primary/30 focus:border-primary"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            value={refillFormData.company_name}
                            onChange={(e) =>
                              setRefillFormData((prev) => ({
                                ...prev,
                                company_name: e.target.value,
                              }))
                            }
                            className="border-2 border-primary/30 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="FSNO">FSNO</Label>
                          <Input
                            id="FSNO"
                            value={refillFormData.FSNO}
                            onChange={(e) =>
                              setRefillFormData((prev) => ({
                                ...prev,
                                FSNO: e.target.value,
                              }))
                            }
                            className="border-2 border-primary/30 focus:border-primary"
                          />
                        </div>

                        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                          <h3 className="font-semibold text-sm">
                            Quantity Calculation (Optional)
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="refill_number_of_boxes">
                                Number of Boxes
                              </Label>
                              <Input
                                id="refill_number_of_boxes"
                                type="number"
                                value={refillFormData.number_of_boxes}
                                onChange={(e) =>
                                  setRefillFormData((prev) => ({
                                    ...prev,
                                    number_of_boxes: e.target.value,
                                  }))
                                }
                                className="border-2 border-primary/30 focus:border-primary"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="refill_strips_per_box">
                                Strips/Box
                              </Label>
                              <Input
                                id="refill_strips_per_box"
                                type="number"
                                value={refillFormData.strips_per_box}
                                onChange={(e) =>
                                  setRefillFormData((prev) => ({
                                    ...prev,
                                    strips_per_box: e.target.value,
                                  }))
                                }
                                className="border-2 border-primary/30 focus:border-primary"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="refill_pieces_per_strip">
                                Pieces/Strip
                              </Label>
                              <Input
                                id="refill_pieces_per_strip"
                                type="number"
                                value={refillFormData.pieces_per_strip}
                                onChange={(e) =>
                                  setRefillFormData((prev) => ({
                                    ...prev,
                                    pieces_per_strip: e.target.value,
                                  }))
                                }
                                className="border-2 border-primary/30 focus:border-primary"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="bg-primary/10 p-3 rounded-md">
                            <p className="text-sm font-medium">
                              Total Pieces:{" "}
                              <span className="text-lg font-bold">
                                {calculateRefillTotalPieces()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsRefillDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isRefilling}>
                          Refill
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isHistoryDialogOpen}
                  onOpenChange={setIsHistoryDialogOpen}
                >
                  <DialogContent className="w-[95vw] sm:max-w-full lg:max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>
                        Refill History - {historyMedicine?.brand_name}
                      </DialogTitle>
                      <DialogDescription>
                        View all refill records for this medicine
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 w-full overflow-x-auto">
                      {(() => {
                        const medicineRefills =
                          refills?.results.filter(
                            (r) => r.medicine === historyMedicine?.id.toString()
                          ) || [];

                        return medicineRefills.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto">
                            <Table className="min-w-[800px]">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Batch No</TableHead>
                                  <TableHead>Manufactured Date</TableHead>
                                  <TableHead>Refilled Quantity</TableHead>
                                  <TableHead>Refill Date</TableHead>
                                  <TableHead>Expire Date</TableHead>
                                  <TableHead>Refilled By</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {medicineRefills.map((record, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{record.batch_no}</TableCell>
                                    <TableCell>
                                      {record.manufacture_date}
                                    </TableCell>
                                    <TableCell>{record.quantity}</TableCell>
                                    <TableCell>
                                      {new Date(
                                        record.refill_date
                                      ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      {record.expire_date
                                        ? new Date(
                                            record.expire_date
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      {record.created_by_username}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No refill history available.
                          </p>
                        );
                      })()}
                    </div>

                    <DialogFooter>
                      <Button onClick={() => setIsHistoryDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/12 text-muted-foreground h-5 w-5" />
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
                    <TableHead className="text-foreground">FSNO</TableHead>
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
                      <TableHead className="text-foreground">Refills</TableHead>
                    )}
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
                              {medicine.generic_name}
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
                        <TableCell className="text-foreground">
                          {medicine.FSNO || "N/A"}
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
                          <TableCell className="text-foreground">
                            {medicine.refill_count}
                          </TableCell>
                        )}
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefill(medicine)}
                                className="hover:bg-accent"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHistory(medicine)}
                                className="hover:bg-accent"
                              >
                                <History className="h-4 w-4" />
                              </Button>
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
