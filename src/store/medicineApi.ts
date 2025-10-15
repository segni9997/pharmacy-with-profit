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
  | "PK";

export type Medicine = {
  id: string;
  code_no: string;
  brand_name: string;
  generic_name: string;
  batch_no: string;
  manufacture_date: string;
  company_name?: string;
  FSNO?: string;
  expire_date: string;
  buying_price?: string;
  price: string;
  stock: number;
  department: string;
  attachment?: string;
  refill_count: number;
  unit_type: MedicineUnit;
  number_of_boxes?: number;
  department_id?: string;
  strips_per_box?: number;
  pieces_per_strip?: number;
  piece_price?: number;
  unit: string;
};

export type GetMedicine = {
  code_no?: string;
  id: string;
  brand_name: string;
  generic_name: string;
  batch_no: string;
  manufacture_date: string;
  company_name?: string;
  FSNO?: string;
  expire_date: string;
  buying_price?: string;
  price: string;
  stock: number;
  department: {
    code: string;
    name: string;
    id: string;
  };
  attachment?: string;
  refill_count: number;
  unit_type: MedicineUnit;
  number_of_boxes?: number;
  strips_per_box?: number;
  pieces_per_strip?: number;
  piece_price?: number;
  unit: string;
  profit_per_item?: number;
  total_profit?: number;
  is_expired?: boolean;
  is_nearly_expired?: boolean;
  is_out_of_stock?: boolean;
  low_stock_threshold?: number;
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
      { pageNumber?: number; pageSize?: number; unit?: string }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        queryParams.append("unit", params.unit ?? "");
        const url = `/pharmacy/medicines/?${queryParams.toString()}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getMedicineByCode: builder.query<Medicine, string>({
      query: (code_no) => ({
        url: `/pharmacy/medicines/${code_no}/`,
        method: "GET",
      }),
    }),
    createMedicine: builder.mutation<Medicine, Partial<Medicine>>({
      query: (body) => ({
        url: "/pharmacy/medicines/",
        method: "POST",
        body,
      }),
    }),
    updateMedicine: builder.mutation<Medicine, Partial<Medicine>>({
      query: ({ id, ...rest }) => ({
        url: `/pharmacy/medicines/${id}/`,
        method: "PUT",
        body: rest,
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
  useGetMedicineByCodeQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi as typeof medicineApi;
