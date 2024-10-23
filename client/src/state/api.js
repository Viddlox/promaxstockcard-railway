import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["Inventory", "Dashboard", "Products", "Orders", "Customers"],
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
        body: {
          productId,
          productName,
          basePrice,
          quantity,
          bom: JSON.stringify(bom),
        },
      }),
      invalidatesTags: ["Products"],
    }),
    getOrders: build.query({
      query: ({ limit = 10, cursor, search }) => ({
        url: "/orders",
        params: {
          limit,
          cursor: cursor !== null ? cursor : undefined,
          search: search ? search : undefined,
        },
      }),
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: ({
        orderType,
        orderItems,
        agentId,
        customerId = null,
        paymentMethod = null,
        notes = "",
      }) => ({
        url: "/orders/create",
        method: "POST",
        body: {
          orderType,
          orderItems: JSON.stringify(orderItems),
          agentId,
          customerId,
          paymentMethod,
          notes,
        },
      }),
      invalidatesTags: ["Orders", "Inventory", "Dashboard"],
    }),
    deleteOrders: build.mutation({
      query: ({ orderIds = [] }) => ({
        url: "/orders/delete",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
      }),
      invalidatesTags: ["Orders"],
    }),
    getCustomers: build.query({
      query: ({ limit = 10, cursor, search }) => ({
        url: "/customers",
        params: {
          limit,
          cursor: cursor !== null ? cursor : undefined,
          search: search ? search : undefined,
        },
      }),
      providesTags: ["Customers"],
    }),
    getDashboardMetrics: build.query({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useCreateInventoryPartMutation,
  useDeleteInventoryPartsMutation,
  useGetProductsQuery,
  useDeleteProductsMutation,
  useCreateProductMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetCustomersQuery,
  useDeleteOrdersMutation,
  useGetDashboardMetricsQuery,
} = api;
