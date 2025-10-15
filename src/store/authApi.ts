// src/store/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface LoginResponse {
  user: User;
 
    access: string;
    refresh: string;
  
}

interface LoginRequest {
  username: string;
  password: string;
}
export const API_URL = import.meta.env.VITE_API_URL
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // 🔑 Read token straight from localStorage
      const stored = localStorage.getItem("token_access");
      if (stored) {
        try {
        
            headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          toast.error("Failed to login, Check your credentials");
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/accounts/token/",
        method: "POST",
        body: credentials,
      }),
    }),
    profile: builder.query<User, void>({
      query: () => ({
        url: "/accounts/users/me/",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useProfileQuery, useLazyProfileQuery } =
  authApi;
