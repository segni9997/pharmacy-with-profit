
import { useGetalertsQuery, type GetMedicine } from "@/store/medicineApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package, TrendingDown, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jwtDecode } from "jwt-decode";

export default function AlertsPage() {
  const { data: meds , isLoading} = useGetalertsQuery(
  
  );console.log(meds)

  const user: any = jwtDecode(localStorage.getItem("access_token") || "");
  const canEdit = user?.role === "admin";


  const expiredMedicines =
    meds?.data.filter((med) => {
      const expiryDate = new Date(med.expire_date);
      const today = new Date();
      return expiryDate < today;
    }) || [];

  const expiringMedicines =
    meds?.data.filter((med) => {
      const today = new Date();
      const alertDate = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const expiryDate = new Date(med.expire_date);
      return expiryDate >= today && expiryDate <= alertDate;
    }) || [];

  const lowStockMedicines =
    meds?.data.filter((med) => med.total_stock_units <= med.low_threshold) ||
    [];

  const outOfStockMedicines =
    meds?.data.filter((med) => med.total_stock_units === 0) || [];

  const MedicineTableRow = ({ medicine }: { medicine: GetMedicine }) => (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        {medicine.attachment ? (
          <img
            src={medicine.attachment || "/placeholder.svg"}
            alt={medicine.brand_name}
            className="w-10 h-10 object-cover rounded-lg shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </TableCell>
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
      <TableCell className="font-mono text-sm text-muted-foreground">
        {medicine.batch_no}
      </TableCell>
      <TableCell className="text-foreground">
        {medicine.department?.name || "N/A"}
      </TableCell>
      <TableCell className="text-foreground">
        {medicine.unit || "N/A"}
      </TableCell>
      <TableCell className="text-foreground">
        {new Date(medicine.expire_date).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-medium">
          {medicine.total_stock_units} {medicine.unit}
        </Badge>
      </TableCell>
      {canEdit && (
        <TableCell className="font-semibold text-foreground">
          Birr {Number.parseFloat(medicine.price).toFixed(2)}
        </TableCell>
      )}
    </TableRow>
  );
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
}
  return (
    <div className="min-h-screen bg-gradient-to-r from-background via-card to-background dark:from-background dark:via-card dark:to-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-md dark:from-primary dark:to-secondary">
        <div className="flex h-16 items-center justify-between px-6 w-full">
          <h1 className="text-lg md:text-2xl font-extrabold text-white tracking-wide">
            Medicine Alerts
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-8xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Expired Card */}
          <Card className="border-destructive/20 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10 pt-0 mt-0">
            <CardHeader className="pb-3 pt-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {expiredMedicines.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Medicines past expiry date
              </p>
            </CardContent>
          </Card>

          {/* Expiring Soon Card */}
          <Card className="border-warning/20 bg-warning/5 dark:border-warning/40 dark:bg-warning/10 pt-0">
            <CardHeader className="pb-3 ">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {expiringMedicines.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Within alert threshold
              </p>
            </CardContent>
          </Card>

          {/* Low Stock Card */}
          <Card className="border-yellow-500/20 bg-yellow-500/5 dark:border-yellow-500/40 dark:bg-yellow-500/10 pt-0 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <TrendingDown className="h-5 w-5" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                {lowStockMedicines.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Below threshold
              </p>
            </CardContent>
          </Card>

          {/* Out of Stock Card */}
          <Card className="border-red-500/20 bg-red-500/5 dark:border-red-500/40 dark:bg-red-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-500">
                <Package className="h-5 w-5" />
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                {outOfStockMedicines.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zero units available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Alert Types */}
        <Tabs defaultValue="expired" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Expired</span>
              <Badge variant="destructive" className="ml-2">
                {expiredMedicines.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="expiring" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Expiring</span>
              <Badge variant="warning" className="ml-2">
                {expiringMedicines.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="lowstock" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Low Stock</span>
              <Badge className="ml-2">{lowStockMedicines.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="outofstock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Out</span>
              <Badge variant="destructive" className="ml-2">
                {outOfStockMedicines.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Expired Medicines Tab */}
          <TabsContent value="expired" className="mt-6">
            <Card className="shadow-xl border-border pt-0">
              <CardHeader className="bg-gradient-to-r from-destructive/10 to-destructive/5 dark:from-destructive/20 p-2 dark:to-destructive/10">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Expired Medicines
                </CardTitle>
                <CardDescription>
                  Medicines that have passed their expiry date
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {expiredMedicines.length === 0 ? (
                  <Alert className="border-green-500/20 bg-green-500/5 dark:border-green-500/40 dark:bg-green-500/10">
                    <AlertDescription className="text-green-600 dark:text-green-500">
                      No expired medicines found. Great job keeping inventory
                      fresh!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">
                            Image
                          </TableHead>
                          <TableHead className="text-foreground">
                            Medicine
                          </TableHead>
                          <TableHead className="text-foreground">
                            Batch No
                          </TableHead>
                          <TableHead className="text-foreground">
                            Department
                          </TableHead>
                          <TableHead className="text-foreground">
                            Unit
                          </TableHead>
                          <TableHead className="text-foreground">
                            Expiry Date
                          </TableHead>
                          <TableHead className="text-foreground">
                            Stock
                          </TableHead>
                          {canEdit && (
                            <TableHead className="text-foreground">
                              Price
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiredMedicines.map((medicine) => (
                          <MedicineTableRow
                            key={medicine.id}
                            medicine={medicine}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expiring Soon Tab */}
          <TabsContent value="expiring" className="mt-6">
            <Card className="shadow-xl border-border pt-0">
              <CardHeader className="bg-gradient-to-r p-2 from-warning/10 to-warning/5 dark:from-warning/20 dark:to-warning/10">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Clock className="h-5 w-5" />
                  Expiring Soon
                </CardTitle>
                <CardDescription>
                  Medicines expiring within the alert threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {expiringMedicines.length === 0 ? (
                  <Alert className="border-green-500/20 bg-green-500/5 dark:border-green-500/40 dark:bg-green-500/10">
                    <AlertDescription className="text-green-600 dark:text-green-500">
                      No medicines expiring soon. Your inventory is in good
                      shape!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">
                            Image
                          </TableHead>
                          <TableHead className="text-foreground">
                            Medicine
                          </TableHead>
                          <TableHead className="text-foreground">
                            Batch No
                          </TableHead>
                          <TableHead className="text-foreground">
                            Department
                          </TableHead>
                          <TableHead className="text-foreground">
                            Unit
                          </TableHead>
                          <TableHead className="text-foreground">
                            Expiry Date
                          </TableHead>
                          <TableHead className="text-foreground">
                            Stock
                          </TableHead>
                          {canEdit && (
                            <TableHead className="text-foreground">
                              Price
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expiringMedicines.map((medicine) => (
                          <MedicineTableRow
                            key={medicine.id}
                            medicine={medicine}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Low Stock Tab */}
          <TabsContent value="lowstock" className="mt-6">
            <Card className="shadow-xl border-border p-0">
              <CardHeader className="bg-gradient-to-r p-2 from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10">
                <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                  <TrendingDown className="h-5 w-5" />
                  Low Stock Medicines
                </CardTitle>
                <CardDescription>
                  Medicines below their low stock threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {lowStockMedicines.length === 0 ? (
                  <Alert className="border-green-500/20 bg-green-500/5 dark:border-green-500/40 dark:bg-green-500/10">
                    <AlertDescription className="text-green-600 dark:text-green-500">
                      All medicines are well stocked. No low stock alerts!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">
                            Image
                          </TableHead>
                          <TableHead className="text-foreground">
                            Medicine
                          </TableHead>
                          <TableHead className="text-foreground">
                            Batch No
                          </TableHead>
                          <TableHead className="text-foreground">
                            Department
                          </TableHead>
                          <TableHead className="text-foreground">
                            Unit
                          </TableHead>
                          <TableHead className="text-foreground">
                            Expiry Date
                          </TableHead>
                          <TableHead className="text-foreground">
                            Stock
                          </TableHead>
                          {canEdit && (
                            <TableHead className="text-foreground">
                              Price
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowStockMedicines.map((medicine) => (
                          <MedicineTableRow
                            key={medicine.id}
                            medicine={medicine}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Out of Stock Tab */}
          <TabsContent value="outofstock" className="mt-6">
            <Card className="shadow-xl border-border p-0">
              <CardHeader className="bg-gradient-to-r p-2 from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/10">
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
                  <Package className="h-5 w-5" />
                  Out of Stock
                </CardTitle>
                <CardDescription>
                  Medicines with zero units available
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {outOfStockMedicines.length === 0 ? (
                  <Alert className="border-green-500/20 bg-green-500/5 dark:border-green-500/40 dark:bg-green-500/10">
                    <AlertDescription className="text-green-600 dark:text-green-500">
                      No out of stock medicines. Inventory is complete!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-foreground">
                            Image
                          </TableHead>
                          <TableHead className="text-foreground">
                            Medicine
                          </TableHead>
                          <TableHead className="text-foreground">
                            Batch No
                          </TableHead>
                          <TableHead className="text-foreground">
                            Department
                          </TableHead>
                          <TableHead className="text-foreground">
                            Unit
                          </TableHead>
                          <TableHead className="text-foreground">
                            Expiry Date
                          </TableHead>
                          <TableHead className="text-foreground">
                            Stock
                          </TableHead>
                          {canEdit && (
                            <TableHead className="text-foreground">
                              Price
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outOfStockMedicines.map((medicine) => (
                          <MedicineTableRow
                            key={medicine.id}
                            medicine={medicine}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
