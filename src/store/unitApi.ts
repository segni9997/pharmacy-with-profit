import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "./authApi";
import type { pagination } from "./saleApi";
import { toast } from "sonner";

export interface Unit {
    id: string;
  code: string;
  name: string;
}

interface PaginatedUnitsResponse {
 pagination: pagination
  results: Unit[];
}

export const unitApi = createApi({
  reducerPath: "unitApi",
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
    getUnits: builder.query<PaginatedUnitsResponse, { pageNumber?: number; pageSize?: number }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        const url = `/pharmacy/departments/?${queryParams.toString()}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getUnitByCode: builder.query<Unit, string>({
      query: (code) => ({
        url: `/pharmacy/departments/${code}/`,
        method: "GET",
      }),
    }),
    createUnit: builder.mutation<Unit, Partial<Unit>>({
      query: (body) => ({
        url: "/pharmacy/departments/",
        method: "POST",
        body,
      }),
    }),
    updateUnit: builder.mutation<Unit, Unit>({
      query: ({ id, ...rest}) => ({
        url: `/pharmacy/departments/${id}/`,
        method: "PUT",
        body: rest,
      }),
    }),
    deleteUnit: builder.mutation<void, string>({
      query: (code) => ({
        url: `/pharmacy/departments/${code}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitByCodeQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi as typeof unitApi;
