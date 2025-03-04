import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setAccessToken, setRefreshToken, logoutUser, setUsedToken } from "./index.js";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().global.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const refreshToken = api.getState().global.refreshToken;
  const accessToken = api.getState().global.accessToken;

  // If request is unauthorized (401), try refreshing the token
  if (result.error && result.error.status === 401) {
    if (!refreshToken || !accessToken) {
      console.log("No refresh token available, logging out...");
      return result;
    }

    console.log("Storing used token and attempting to refresh...");

    // Store the last used access token before refreshing (new step)
    api.dispatch(setUsedToken(accessToken));

    // Attempt to refresh the token
    const refreshResult = await baseQuery(
      {
        url: "/user/token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Store the new tokens
      api.dispatch(setAccessToken(refreshResult.data.accessToken));
      api.dispatch(setRefreshToken(refreshResult.data.refreshToken));

      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh token failed, logging out...");
      api.dispatch(logoutUser());
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth, // Use the wrapped base query
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
} = api;
