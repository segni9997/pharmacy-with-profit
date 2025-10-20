import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Sale, SaleItem } from "@/lib/types";
import { API_URL } from "./authApi";
import { toast } from "sonner";
export interface  pagination {
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
interface PaginatedSalesResponse {
  results: Sale[];
  pagination: pagination;
 
}

interface PaginatedSaleItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SaleItem[];
}

export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          toast.error("Failed to set authorization header");
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSales: builder.query<
      PaginatedSalesResponse,
      { pageNumber?: number; pageSize?: number; voucher_number?: string }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        if (params.voucher_number) {
          queryParams.append("voucher_number", String(params.voucher_number));
        }
        const url = `/pharmacy/sales/?${queryParams.toString()}`;
        console.log("urlllllll", url)
        return {
          url,
          method: "GET",
        };
      },
    }),
    getSaleById: builder.query<Sale, string>({
      query: (id) => ({
        url: `/pharmacy/sales/${id}/`,
        method: "GET",
      }),
    }),
    createSale: builder.mutation<
      Sale,
      {
        customer_name?: string;
        customer_phone?: string;
        customer_address?: string;
        vat_regno?: string;
        fno?: string;
        TIN_number?: string;
        payment_method?: string;
        discount_percentage: number;
        sold_by: string;
        input_items: {
          medicine: string;
          quantity: number;
          price: number;
          sale_type: string;
        }[];
      }
    >({
      query: (body) => ({
        url: "/pharmacy/sales/",
        method: "POST",
        body,
      }),
    }),
    getSaleItems: builder.query<PaginatedSaleItemsResponse, string>({
      query: (saleId) => ({
        url: `/pharmacy/sale-items/?sale=${saleId}`,
        method: "GET",
      }),
    }),
    createSaleItem: builder.mutation<SaleItem, Partial<SaleItem>>({
      query: (body) => ({
        url: "/pharmacy/sale-items/",
        method: "POST",
        body,
      }),
    }),
    updateSale: builder.mutation<
      Sale,
      {
        id: string;
        customer_name?: string;
        customer_phone?: string;
        customer_address?: string;
        vat_regno?: string;
        fno?: string;
        TIN_number?: string;
        payment_method?: string;
        discount_percentage: number;
        sold_by: string;
        input_items: {
          medicine: string;
          quantity: number;
          price: number;
        }[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/pharmacy/sales/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    deleteSale: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pharmacy/sales/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useGetSaleItemsQuery,
  useCreateSaleItemMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useLazyGetSaleByIdQuery,
} = saleApi;
