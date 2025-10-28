"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsIcon, X } from "lucide-react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/store/settingsApi";
import type { Settings } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function FloatingSettingsWidget() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" ;
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<Partial<Settings>>({});

  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const handleOpenExpand = () => {
    if (settings) {
      setFormData(settings);
    }
    setIsExpanded(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      await updateSettings(formData).unwrap();
      toast.success("Settings updated successfully");
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <>
      <button
        onClick={handleOpenExpand}
        className="fixed bottom-16 right-4 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
        aria-label="Open settings"
      >
        <SettingsIcon className="h-6 w-6" />
      </button>

      {isExpanded && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsExpanded(false)}
          />

          {/* Expanded Card */}
          <div className="fixed bottom-20 right-4 z-50 md:w-72 lg:w-96 w-[90%]  max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? "Manage pharmacy configuration"
                      : "View pharmacy settings"}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>

              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading settings...
                    </p>
                  </div>
                ) : !settings ? (
                  <p className="text-sm text-destructive">
                    Failed to load settings
                  </p>
                ) : (
                  <>
                    {/* Discount */}
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm font-medium">
                        Discount (%)
                      </Label>
                      {isAdmin ? (
                        <Input
                          id="discount"
                          type="number"
                              step="0.1"
                              min="0"
                              max="100"
                          value={formData.discount  || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <div className="p-3 bg-muted rounded-md text-sm font-medium">
                          {settings.discount}%
                        </div>
                      )}
                    </div>

                    {/* Low Stock Threshold */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="low_stock_threshold"
                        className="text-sm font-medium"
                      >
                        Low Stock(carton) Threshold
                      </Label>
                      {isAdmin ? (
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          value={
                            formData.low_stock_threshold ||
                            settings.low_stock_threshold ||
                            ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              low_stock_threshold: Number.parseInt(
                                e.target.value
                              ),
                            })
                          }
                        />
                      ) : (
                        <div className="p-3 bg-muted rounded-md text-sm font-medium">
                          {settings.low_stock_threshold}
                        </div>
                      )}
                    </div>

                    {/* Expired Date Alert */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="expired_date"
                        className="text-sm font-medium"
                      >
                        Expired Date Alert (days)
                      </Label>
                      {isAdmin ? (
                        <Input
                          id="expired_date"
                          type="number"
                          value={
                            formData.expired_date || settings.expired_date || ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expired_date: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <div className="p-3 bg-muted rounded-md text-sm font-medium">
                          {settings.expired_date}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isAdmin && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsExpanded(false)}
                          disabled={isUpdating}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isUpdating}
                          className="flex-1"
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}

                    {!isAdmin && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsExpanded(false)}
                          className="w-full"
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
