import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "./authApi";
import { toast } from "sonner";



export const exportApi = createApi({
  reducerPath: "exportApi",
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
    exportExcel: builder.query({
      query: (endpoint) => ({
        url: endpoint,
        responseHandler: async (response) => {
          // Convert response to Blob instead of JSON
            const blob = await response.blob();
            const now = new Date();
              const dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(now.getDate()).padStart(2, "0")}_${String(
                now.getHours()
              ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
                now.getSeconds()
              ).padStart(2, "0")}`;
            
              const filename = `${"medicine"}_${dateTime}.xlsx`;
            
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.click();
        },
      }),
    }),
  }),
});

export const {
useLazyExportExcelQuery, useExportExcelQuery
} = exportApi;
