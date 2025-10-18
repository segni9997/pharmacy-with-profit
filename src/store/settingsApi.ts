import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Settings } from "@/lib/types";
import { API_URL } from "./authApi";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => "/pharmacy/settings/",
    }),
    updateSettings: builder.mutation<Settings, Partial<Settings>>({
      query: (settings) => ({
        url: "/pharmacy/settings/",
        method: "POST",
        body: settings,
      }),
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
