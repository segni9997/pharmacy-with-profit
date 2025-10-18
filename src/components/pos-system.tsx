
import { useState, useMemo } from "react";
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
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetMedicinesQuery,
  type MedicineUnit,
} from "@/store/medicineApi";
import {
  useGetUnitsQuery,
} from "@/store/unitApi";
import {
  useCreateSaleMutation,
} from "@/store/saleApi";
import { toast } from "sonner";
import { useQueryParamsState } from "@/hooks/useQueryParamsState";
import { Pagination } from "@/components/ui/pagination";

interface CartItem {
  medicine: GetMedicine;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
  } = useQueryParamsState({
    defaultBatchNo: "",
  });

  const { data: medicines ,refetch} = useGetMedicinesQuery({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    batch_no: batchNo,
  });
  const { data: units } = useGetUnitsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const [createSale] = useCreateSaleMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUnitType, setSelectedUnitType] = useState<string>("all");
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
    { value: "10x100", label: "10 x 100" },
    { value: "Of10", label: "Of 10" },
    { value: "Of20", label: "Of 20" },
    { value: "Of14", label: "Of 14" },
    { value: "Of28", label: "Of 28" },
    { value: "Of30", label: "Of 30" },
    { value: "Suppository", label: "Suppository" },
    { value: "Pcs", label: "Pcs" },
    {value:"Pk", label:"Pk"}
  ];
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [vatRegno, setVatRegno] = useState("");
  const [fno, setFno] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);
  // const [showReceipt, setShowReceipt] = useState(false);
  // const [lastSale, setLastSale] = useState<Sale | null>(null);
  // const [lastSaleItems, setLastSaleItems] = useState<SaleItem[]>([]);

  const filteredMedicines = useMemo(() => {
    return (medicines?.results || []).filter((medicine) => {
      const matchesSearch =
        medicine.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batch_no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || medicine.department.id === selectedCategory;
      const matchesUnitType =
        selectedUnitType === "all" || medicine.unit === selectedUnitType;
      const inStock = medicine.stock > 0;
      return matchesSearch && matchesCategory && matchesUnitType && inStock;
    });
  }, [medicines, searchTerm, selectedCategory, selectedUnitType]);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const addToCart = (medicine: GetMedicine) => {
    const existingItem = cart.find((item) => item.medicine.id === medicine.id);

    if (existingItem) {
      if (existingItem.quantity < medicine.stock) {
        setCart((prev) =>
          prev.map((item) =>
            item.medicine.id === medicine.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  totalPrice: (item.quantity + 1) * item.unitPrice,
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
          unitPrice: parseFloat(medicine.price),
          totalPrice: parseFloat(medicine.price),
        },
      ]);
    }
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines?.results.find((med) => med.id === medicineId);
    if (!medicine || newQuantity > medicine.stock) return;

    setCart((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setVatRegno("");
    setFno("");
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
      payment_method: paymentMethod || "",
      discount_percentage: discount,
      sold_by: user?.id || "",
      input_items: cart.map((item) => ({
        medicine: item.medicine.id,
        quantity: item.quantity,
        price: item.unitPrice,
        // total_price: item.totalPrice,
      })),
    };
console.log("salepayload", salePayload)
    try {
      const createdSale = await createSale(salePayload).unwrap();
      toast.success(`${createdSale.items.length} items sold!`);
      // Navigate to invoice with sale data
      navigate("/invoice", { state: { sale: createdSale , ...(customerAddress && {address:customerAddress}), ...(vatRegno && {vatreg:vatRegno}), ...(fno && {fno:fno})} });
      refetch()
      clearCart();
    } catch (error) {
      console.log(error)
    }
  };

  const getCategoryName = (categoryId: string) => {
    return (
      units?.results.find((cat) => cat.id === categoryId)?.name || "Unknown"
    );
  };

  // const printReceipt = () => {
  //   window.print();
  // };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="md:text-3xl text-lg font-bold text-primary">
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {units?.results.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedUnitType}
                    onValueChange={setSelectedUnitType}
                  >
                    <SelectTrigger className="w-full sm:w-48">
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

                {/* Medicine Table */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredMedicines.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No medicines found
                    </p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Batch No</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Unit Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Cartons</TableHead>
                            <TableHead>sock In Units</TableHead>
                            <TableHead>Add To Cart</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMedicines.map((medicine) => (
                            <TableRow
                              key={medicine.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => addToCart(medicine)}
                            >
                              <TableCell>{medicine.item_name}</TableCell>
                              <TableCell>{medicine.batch_no}</TableCell>
                              <TableCell>
                                {getCategoryName(medicine.department?.id)}
                              </TableCell>
                              <TableCell>{medicine.unit || "N/A"}</TableCell>
                              <TableCell>Birr {medicine.price}</TableCell>
                              <TableCell>{medicine.stock_in_carton}</TableCell>
                              <TableCell>{medicine.stock_in_unit}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost">
                                  <Plus className="h-4 w-4" />
                                </Button>
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
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.medicine.id}>
                          <TableCell>{item.medicine.brand_name}</TableCell>
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
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.medicine.stock}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.medicine.id,
                                    parseInt(e.target.value) || 1
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
                                    item.quantity + 1
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
                              onClick={() => removeFromCart(item.medicine.id)}
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
                  {discount > 0 && (
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

      {/* Receipt Dialog */}
    </div>
  );
}
