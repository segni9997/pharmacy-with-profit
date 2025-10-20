import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { pagination } from "./saleApi";
import { API_URL } from "./authApi";
import { toast } from "sonner";

export type MedicineUnit =
  | "Bottle"
  | "Sachet"
  | "Ampule"
  | "Vial"
  | "Tin"
  | "Strip"
  | "Tube"
  | "Box"
  | "Cosmetics"
  | "10x100"
  | "Of10"
  | "Of20"
  | "Of14"
  | "Of28"
  | "Of30"
  | "Suppository"
  | "Pcs"
  | "Tablet"
  | "Pk";

export type MedicinePayload = {
  brand_name: string;
  item_name: string;
  batch_no: string;
  manufacture_date?: string ;
  expire_date: string;
  buying_price: number;
  price: number;
  stock: number;
  stock_in_unit: number;
  stock_carton: number;
  units_per_carton:number;

  unit: MedicineUnit;
  company_name?: string;
  department_id: string;
  TIN_number?: string;
};

export type GetMedicine = {
  id: string;
  brand_name: string;
  item_name: string;
  batch_no: string;
  manufacture_date: string;
  expire_date: string;
  buying_price: string;
  price: string;
  total_profit: number;
  profit_per_item: number;
  stock: number;
  stock_in_unit: number;
  stock_carton: number;
  units_per_carton: number;
  total_stock_units: number;
  low_stock_threshold: number;
  unit: MedicineUnit;
  unit_display: string;
  company_name: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  attachment: string | null;
  is_out_of_stock: boolean;
  is_expired: boolean;
  is_nearly_expired: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  refill_count?: number;
  TIN_number?: string;
};

interface PaginatedMedicinesResponse {
  results: GetMedicine[];
  pagination: pagination;
}

export const medicineApi = createApi({
  reducerPath: "medicineApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          toast.error("Failed to authorize");
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMedicines: builder.query<
      PaginatedMedicinesResponse,
      {
        pageNumber?: number;
        pageSize?: number;
        unit?: string;
        batch_no?: string;
        search?: string;
      }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        if (params.unit) queryParams.append("unit", params.unit);
        if (params.batch_no) queryParams.append("batch_no", params.batch_no);
        if(params.search) queryParams.append("search", params.search);
        const url = `/pharmacy/medicines/?${queryParams.toString()}`;
        return { url, method: "GET" };
      },
    }),

    getMedicineById: builder.query<GetMedicine, string>({
      query: (id) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "GET",
      }),
    }),

    createMedicine: builder.mutation<GetMedicine, MedicinePayload>({
      query: (body) => ({
        url: "/pharmacy/medicines/",
        method: "POST",
        body,
      }),
    }),

    updateMedicine: builder.mutation<
      GetMedicine,
      { id: string } & Partial<MedicinePayload>
    >({
      query: ({ id, ...body }) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "PUT",
        body,
      }),
    }),

    deleteMedicine: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
