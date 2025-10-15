import type { Userinfo } from "@/lib/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "./authApi";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface PaginatedUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}   

interface CreateUserRequest {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // 🔑 Read token straight from localStorage
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          headers.set("Authorization", `Bearer ${stored}`);
        } catch (e) {
          toast.error("Failed to parse token_access from localStorage");
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<
      PaginatedUsersResponse,
      { pageNumber?: number; pageSize?: number }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append("pageNumber", String(params.pageNumber ?? 1));
        queryParams.append("page_size", String(params.pageSize ?? 10));
        const url = `/accounts/users/?${queryParams.toString()}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getUsersById: builder.query<Userinfo, string>({
      query: (id) => ({
        url: `/accounts/users/${id}/`,
        method: "GET",
      }),
    }),
    updateUsersById: builder.mutation<User, User>({
      query: (body) => ({
        url: `/accounts/users/${body.id}/`,
        method: "PUT",
        body: {
          username: body.username,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          role: body.role,
        },
      }),
    }),
    deleteUsersById: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounts/users/${id}/`,
        method: "DELETE",
      }),
    }),
    patchUsersById: builder.mutation<User, string>({
      query: (id) => ({
        url: `/accounts/users/`,
        method: "GET",
        body: { id },
      }),
    }),
    CreateUSer: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: `/accounts/register/`,
        method: "POST",
        body,
      }),
    }),
    whoami: builder.query<User, void>({
      query: () => ({
        url: "/accounts/users/me/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUsersByIdQuery ,useLazyGetUsersByIdQuery, useWhoamiQuery,useCreateUSerMutation, usePatchUsersByIdMutation,useUpdateUsersByIdMutation, useDeleteUsersByIdMutation} = userApi;
