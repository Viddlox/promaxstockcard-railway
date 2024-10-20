import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["Inventory"],
  endpoints: (build) => ({
    getInventory: build.query({
      query: ({ limit = 10, cursor, search }) => ({
        url: "/inventory",
        params: {
          limit,
          cursor: cursor !== null ? cursor : undefined,
          search: search ? search : undefined,
        },
      }),
      providesTags: ["Inventory"],
    }),
    createInventoryPart: build.mutation({
      query: ({ partId, partName, partPrice, partQuantity, partUoM }) => ({
        url: "/inventory/create",
        method: "POST",
        body: { partId, partName, partPrice, partQuantity, partUoM },
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteInventoryParts: build.mutation({
      query: ({ partIds = [] }) => ({
        url: "/inventory/delete",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partIds }),
      }),
      invalidatesTags: ["Inventory"],
    }),
    getProducts: build.query({
      query: ({ limit = 10, cursor, search }) => ({
        url: "/products",
        params: {
          limit,
          cursor: cursor !== null ? cursor : undefined,
          search: search ? search : undefined,
        },
      }),
      providesTags: ["Products"],
    }),
    deleteProducts: build.mutation({
      query: ({ productIds = [] }) => ({
        url: "/products/delete",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }),
      }),
      invalidatesTags: ["Products"],
    }),
    createProduct: build.mutation({
      query: ({ productId, productName, basePrice, quantity = 1, bom }) => ({
        url: "/products/create",
        method: "POST",
        body: {  productId, productName, basePrice, quantity, bom: JSON.stringify(bom) },
      }),
      invalidatesTags: ["Products"]
    })
  }),
});

export const {
  useGetInventoryQuery,
  useCreateInventoryPartMutation,
  useDeleteInventoryPartsMutation,
  useGetProductsQuery,
  useDeleteProductsMutation,
  useCreateProductMutation
} = api;
