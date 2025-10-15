import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AnalyticsData, OverviewData, ProfitSummary } from "@/lib/types";
import { API_URL } from "./authApi";
import { toast } from "sonner";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
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
    getAnalytics: builder.query<AnalyticsData, void>({
      query: () => ({
        url: "/pharmacy/dashboard/analytics/",
        method: "GET",
      }),
    }),
    getOverview: builder.query<OverviewData, void>({
      query: () => ({
        url: "/pharmacy/dashboard/overview/",
        method: "GET",
      }),
    }),
    getProfitSummary: builder.query<ProfitSummary, void>({
      query: () => ({
        url: "/pharmacy/dashboard/profit_summary/",
        method:"GET"
      }),
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetOverviewQuery,
  useGetProfitSummaryQuery
} = dashboardApi;
