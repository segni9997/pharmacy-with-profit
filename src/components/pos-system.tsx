import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { GetMedicine } from "@/store/medicineApi";
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
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  Package,
  // Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMedicinesQuery, type MedicineUnit } from "@/store/medicineApi";
import { useGetUnitsQuery } from "@/store/unitApi";
import { useCreateSaleMutation } from "@/store/saleApi";
import { toast } from "sonner";
import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";
import { useGetSettingsQuery } from "@/store/settingsApi";
import { NavDropdown } from "./navDropDown";
// import * as XLSX from "xlsx";

interface CartItem {
  medicine: GetMedicine;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sale_type: "carton" | "unit";
}

export function POSSystem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    batchNo,
    setBatchNo,
    searchValue,
    setSearchValue,
    setUnit,
    unit,
  } = useQueryParamsState({
    defaultBatchNo: "",
  });
  const { data: Settings } = useGetSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: medicines, refetch } = useGetMedicinesQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    batch_no: batchNo,
    search: searchValue,
    unit: unit !== "all" ? unit : undefined,
  });
  const { data: units } = useGetUnitsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const [createSale] = useCreateSaleMutation();
  const [cart, setCart] = useState<CartItem[]>([]);

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
    { value: "Pk", label: "Pk" },
  ];
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [vatRegno, setVatRegno] = useState("");
  const [fno, setFno] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (Settings?.discount !== undefined) {
      setDiscount(Settings.discount);
    }
  }, [Settings]);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount =
    discount && discount > 0 ? (subtotal * discount) / 100 : 0;
  const total = subtotal - discountAmount;

  const getAvailableStock = (medicine: GetMedicine) => {
    let cartCartons = 0;
    let cartUnits = 0;

    cart.forEach((item) => {
      if (item.medicine.id === medicine.id) {
        if (item.sale_type === "carton") {
          cartCartons += item.quantity;
        } else {
          cartUnits += item.quantity;
        }
      }
    });

    // Calculate cartons consumed by units
    const unitsPerCarton = medicine.units_per_carton || 1;
    const cartonsFromUnits = Math.ceil(cartUnits / unitsPerCarton);

    // Calculate available stock
    const availableCartons =
      medicine.stock_carton - cartCartons - cartonsFromUnits;
    const availableUnits =
      medicine.total_stock_units - cartUnits - cartCartons * unitsPerCarton;

    return {
      availableCartons: Math.max(0, availableCartons),
      availableUnits: Math.max(0, availableUnits),
    };
  };

  const addToCart = (
    medicine: GetMedicine,
    saleType: "carton" | "unit" = "unit"
  ) => {
    const existingItem = cart.find(
      (item) => item.medicine.id === medicine.id && item.sale_type === saleType
    );

    const unitPrice =
      saleType === "carton"
        ? Number.parseFloat(medicine.price) * (medicine.units_per_carton || 1)
        : Number.parseFloat(medicine.price);

    if (existingItem) {
      const maxQuantity =
        saleType === "carton"
          ? medicine.stock_carton
          : medicine.total_stock_units;

      if (existingItem.quantity < maxQuantity) {
        setCart((prev) =>
          prev.map((item) =>
            item.medicine.id === medicine.id && item.sale_type === saleType
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalPrice: (item.quantity + 1) * unitPrice,
                }
              : item
          )
        );
      }
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicine,
          quantity: 1,
          unitPrice: unitPrice,
          totalPrice: unitPrice,
          sale_type: saleType,
        },
      ]);
    }
  };

  const updateQuantity = (
    medicineId: string,
    newQuantity: number,
    saleType: "carton" | "unit"
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId, saleType);
      return;
    }

    const medicine = medicines?.results.find((med) => med.id === medicineId);
    if (!medicine) return;

    if (saleType === "unit") {
      const unitsPerCarton = medicine.units_per_carton || 1;

      if (newQuantity >= unitsPerCarton) {
        const cartonsToAdd = Math.floor(newQuantity / unitsPerCarton);
        const remainingUnits = newQuantity % unitsPerCarton;

        const cartonUnitPrice =
          Number.parseFloat(medicine.price) * unitsPerCarton;

        // Remove the current unit item
        setCart((prev) =>
          prev.filter(
            (item) =>
              item.medicine.id !== medicineId || item.sale_type !== "unit"
          )
        );

        // Update or add carton item
        setCart((prev) => {
          const existingCartonItem = prev.find(
            (item) =>
              item.medicine.id === medicineId && item.sale_type === "carton"
          );

          if (existingCartonItem) {
            return prev.map((item) =>
              item.medicine.id === medicineId && item.sale_type === "carton"
                ? {
                    ...item,
                    quantity: item.quantity + cartonsToAdd,
                    totalPrice:
                      (item.quantity + cartonsToAdd) * cartonUnitPrice,
                  }
                : item
            );
          } else {
            return [
              ...prev,
              {
                medicine,
                quantity: cartonsToAdd,
                unitPrice: cartonUnitPrice,
                totalPrice: cartonsToAdd * cartonUnitPrice,
                sale_type: "carton",
              },
            ];
          }
        });

        // Add remaining units if any
        if (remainingUnits > 0) {
          setCart((prev) => [
            ...prev,
            {
              medicine,
              quantity: remainingUnits,
              unitPrice: Number.parseFloat(medicine.price),
              totalPrice: remainingUnits * Number.parseFloat(medicine.price),
              sale_type: "unit",
            },
          ]);
        }
        return;
      }
    }

    const maxQuantity =
      saleType === "carton"
        ? medicine.stock_carton
        : medicine.total_stock_units;

    if (newQuantity > maxQuantity) return;

    setCart((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId && item.sale_type === saleType
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string, saleType: "carton" | "unit") => {
    setCart((prev) =>
      prev.filter(
        (item) => item.medicine.id !== medicineId || item.sale_type !== saleType
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setVatRegno("");
    setFno("");
    setTinNumber("");
    setPaymentMethod("");
    setDiscount(0);
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    const salePayload = {
      customer_name: customerName || "",
      customer_phone: customerPhone || "",
      customer_address: customerAddress || "",
      vat_regno: vatRegno || "",
      fno: fno || "",
      TIN_number: tinNumber || "",
      payment_method: paymentMethod || "",
      discount_percentage: discount || 0,
      sold_by: user?.id || "",
      input_items: cart.map((item) => ({
        medicine: item.medicine.id,
        quantity: item.quantity,
        price: item.unitPrice,
        sale_type: item.sale_type,
      })),
    };
    console.log("salepayload", salePayload);
    try {
      const createdSale = await createSale(salePayload).unwrap();
      toast.success(`${createdSale.items.length} items sold!`);
      navigate("/invoice", {
        state: {
          sale: createdSale,
          ...(customerAddress && { address: customerAddress }),
          ...(vatRegno && { vatreg: vatRegno }),
          ...(fno && { fno: fno }),
        },
      });
      refetch();
      clearCart();
    } catch (error) {
      console.log(error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return (
      units?.results.find((cat) => cat.id === categoryId)?.name || "Unknown"
    );
  };

  // const handleExport = () => {
  //   if (!medicines?.results) return;

  //   const data = medicines.results
  //     .filter(
  //       (medicine) =>
  //         medicine.stock_carton > 0 || medicine.total_stock_units > 0
  //     )
  //     .map((medicine) => ({
  //       "Item Name": medicine.item_name,
  //       "Batch No": medicine.batch_no,
  //       Department: getCategoryName(medicine.department?.id),
  //       "Unit Type": medicine.unit || "N/A",
  //       Price: `Birr ${medicine.price}`,
  //       Cartons: medicine.stock_carton,
  //       "Units per Carton": medicine.units_per_carton,
  //       "Stock in Units": medicine.total_stock_units,
  //     }));

  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Medicines");
  //   XLSX.writeFile(wb, "pos_medicines.xlsx");
  // };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <NavDropdown />
      </div>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:hidden text-sm font-bold text-primary">
              POS
            </h1>
            <h1 className="hidden md:flex md:text-3xl text-sm font-bold text-primary">
              Point of Sale
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              Cashier: {user?.username}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/sold-medicines")}
            >
              Sold Medicine
            </Button>
         
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medicine Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Select Medicines
                </CardTitle>
                <CardDescription>
                  Search and add medicines to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search medicines..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by Batch Number..."
                      value={batchNo}
                      onChange={(e) => setBatchNo(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {unitTypeOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Medicine Table */}
                <div className="max-h-96 overflow-y-auto">
                  {medicines?.results.filter(
                    (medicine) =>
                      medicine.stock_carton > 0 ||
                      medicine.total_stock_units > 0
                  ).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No medicines found
                    </p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader className="">
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Batch No</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Unit Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Cartons</TableHead>
                            <TableHead>Units/carton</TableHead>
                            <TableHead>Stock In Units</TableHead>
                            <TableHead>Add Carton</TableHead>
                            <TableHead>Add Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicines?.results
                            .filter(
                              (medicine) =>
                                medicine.stock_carton > 0 ||
                                medicine.total_stock_units > 0
                            )
                            .map((medicine) => (
                              <TableRow
                                key={medicine.id}
                                className="cursor-pointer hover:bg-muted/50"
                              >
                                <TableCell>{medicine.item_name}</TableCell>
                                <TableCell>{medicine.batch_no}</TableCell>
                                <TableCell>
                                  {getCategoryName(medicine.department?.id)}
                                </TableCell>
                                <TableCell>{medicine.unit || "N/A"}</TableCell>
                                <TableCell>Birr {medicine.price}</TableCell>
                                <TableCell>{medicine.stock_carton}</TableCell>
                                <TableCell>
                                  {medicine.units_per_carton}
                                </TableCell>
                                <TableCell>
                                  {medicine.total_stock_units}
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const available =
                                      getAvailableStock(medicine);
                                    return (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        title="Add as carton"
                                        disabled={
                                          available.availableCartons <= 0
                                        }
                                        onClick={() =>
                                          addToCart(medicine, "carton")
                                        }
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const available =
                                      getAvailableStock(medicine);
                                    return (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        title="Add as unit"
                                        disabled={available.availableUnits <= 0}
                                        onClick={() =>
                                          addToCart(medicine, "unit")
                                        }
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    );
                                  })()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={medicines?.pagination.totalPages || 1}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                      />
                    </>
                  )}
                </div>
              </CardContent>
              <CardContent>
                {cart.length > 0 && (
                  <Card className="border-blue-200 bg-background">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Package className="h-5 w-5" />
                        Stock Availability
                      </CardTitle>
                      <CardDescription className="text-foreground">
                        Real-time inventory for items in cart
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from(
                          new Map(
                            cart.map((item) => [
                              item.medicine.id,
                              item.medicine,
                            ])
                          ).values()
                        ).map((medicine) => {
                          const available = getAvailableStock(medicine);
                          // Get all cart items for this medicine
                          const medicineCartItems = cart.filter(
                            (item) => item.medicine.id === medicine.id
                          );

                          return (
                            <div
                              key={medicine.id}
                              className="flex items-center justify-between p-3 bg-background rounded-lg border border-blue-100"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {medicine.item_name} (B-{medicine.batch_no})
                                </p>
                                <p className="text-xs text-foreground">
                                  {medicineCartItems
                                    .map(
                                      (item) =>
                                        `${item.quantity} ${item.sale_type}`
                                    )
                                    .join(" + ")}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Cartons Available
                                    </p>
                                    <p className="text-lg font-bold text-foreground">
                                      {available.availableCartons}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-foreground">
                                      Units Available
                                    </p>
                                    <p className="text-lg font-bold text-accent">
                                      {available.availableUnits}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Cart is empty
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={`${item.medicine.id}-${item.sale_type}`}>
                          <TableCell>
                            {item.medicine.item_name}
                            <p>B-{item.medicine.batch_no}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.sale_type === "carton"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {item.sale_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            Birr {item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.medicine.id,
                                    item.quantity - 1,
                                    item.sale_type
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={
                                  item.sale_type === "carton"
                                    ? item.medicine.stock_carton
                                    : item.medicine.total_stock_units
                                }
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.medicine.id,
                                    Number.parseInt(e.target.value) || 1,
                                    item.sale_type
                                  )
                                }
                                className="w-16 text-center text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.medicine.id,
                                    item.quantity + 1,
                                    item.sale_type
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            Birr {item.totalPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                removeFromCart(item.medicine.id, item.sale_type)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name (opt.)</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number (opt.)</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Address (opt.)</Label>
                    <Input
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatRegno">VAT Reg No (opt.)</Label>
                    <Input
                      id="vatRegno"
                      value={vatRegno}
                      onChange={(e) => setVatRegno(e.target.value)}
                      placeholder="Enter VAT Reg No"
                    />
                  </div>
                </div>
                <div className="flex  flex-wrap  gap-3 space-x-2">
                  <div className="space-y-2">
                    <Label htmlFor="fno">F.No (opt)</Label>
                    <Input
                      id="fno"
                      value={fno}
                      onChange={(e) => setFno(e.target.value)}
                      placeholder="Enter F.No"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tinNumber">TIN Number (opt)</Label>
                    <Input
                      id="tinNumber"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      placeholder="Enter TIN Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem defaultChecked value="cash">
                          Cash
                        </SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout */}
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Birr {subtotal.toFixed(2)}</span>
                  </div>
                  {discount && discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount ({discount}%):</span>
                      <span>-Birr {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Birr {total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={processSale}
                    disabled={cart.length === 0}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Process Sale
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
