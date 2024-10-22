"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { NestedNavbar } from "@/app/(components)/NestedNavbar";
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetInventoryQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
} from "@/state/api";
import { useAppSelector } from "@/app/redux";
import { Book, Trash, PlusSquare } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridActions from "@/app/(components)/DataGridActions";
import { formatTimeStamp } from "@/app/(utils)/date";
import {
  Modal,
  TextField,
  Autocomplete,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const PAGE_SIZE = 10;
const ORDER_TYPE = ["SALE", "STOCK"];

const Orders = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const tabs = [
    { id: "orders", label: "Orders", href: "/orders" },
    { id: "invoices", label: "Invoices", href: "/orders/invoices" },
  ];
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [cursor, setCursor] = useState(null);
  const [rowCountState, setRowCountState] = useState(0);
  const mapPageToNextCursor = useRef({});
  const [rowId, setRowId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [orderParts, setOrderParts] = useState([{ partId: null, quantity: 1 }]);
  const [orderProducts, setOrderProducts] = useState([
    { productId: null, quantity: 1, bom: null, productName: "" },
  ]);
  const [customerDetails, setCustomerDetails] = useState({
    address: "",
    phoneNumber: "",
    ssmNumber: "",
    email: "",
    postCode: "",
  });

  const [formValues, setFormValues] = useState({
    orderType: "",
    paymentMethod: "",
    customerId: "",
    note: "",
  });

  const handlePartSelection = (index, newItem) => {
    const newArr = [...orderParts];

    if (newItem === null) {
      newArr.splice(index, 1);
    } else if (newItem.partId) {
      newArr[index] = { partId: newItem.partId, quantity: 1 };
    }
    setOrderParts(newArr);
  };

  const handlePartQuantityChange = (index, quantity) => {
    const newArr = [...orderParts];
    newArr[index].quantity = quantity;
    setOrderParts(newArr);
  };

  const handleAddPart = () => {
    setOrderParts([...orderParts, { partId: null, quantity: 1 }]);
  };

  const handleRemovePart = (index) => {
    setOrderParts(orderParts.filter((_, i) => i !== index));
  };

  const handleProductSelection = (index, newItem) => {
    const newArr = [...orderProducts];

    if (newItem === null) {
      newArr.splice(index, 1);
    } else if (newItem.productId) {
      newArr[index] = {
        productId: newItem.productId,
        quantity: 1,
        bom: newItem.bom,
        productName: newItem.productName,
      };
    }
    setOrderProducts(newArr);
  };

  const handleProductQuantityChange = (index, quantity) => {
    const newArr = [...orderProducts];
    newArr[index].quantity = quantity;
    setOrderProducts(newArr);
  };

  const handleAddProduct = () => {
    setOrderProducts([...orderProducts, { productId: null, quantity: 1 }]);
  };

  const handleRemoveProduct = (index) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index));
  };

  const handleBomModification = (productIndex, partId, newQuantity) => {
    const newArr = [...orderProducts];
    const product = newArr[productIndex];

    const partIndex = product.bom.findIndex((part) => part.partId === partId);
    if (partIndex !== -1) {
      product.bom[partIndex].quantity = newQuantity;
    }

    setOrderProducts(newArr);
  };

  const handleRemoveBomPart = (productIndex, partId) => {
    const newArr = [...orderProducts];
    const product = newArr[productIndex];

    product.bom = product.bom.filter((part) => part.partId !== partId);

    setOrderProducts(newArr);
  };

  const searchInputGlobal = useAppSelector((state) => state.global.searchInput);

  const columns = useMemo(
    () => [
      { field: "orderId", headerName: "ID", width: 88 },
      {
        field: "itemId",
        headerName: "Item ID",
        width: 200,
        renderCell: (params) =>
          params.row.productId ? params.row.productId : params.row.partId,
      },
      { field: "customerId", headerName: "Customer ID", width: 88 },
      { field: "agentId", headerName: "Agent ID", width: 88 },
      { field: "orderType", headerName: "Order Type", width: 88 },
      {
        field: "modifications",
        headerName: "Details",
        width: 160,
        renderCell: (params) => (
          <button
            onClick={() => {}}
            className="flex flex-row items-center gap-3 hover:text-blue-800"
          >
            <h1>View Order Details</h1>
            <Book size={16} />
          </button>
        ),
      },
      { field: "createdAt", headerName: "Created At", width: 200 },
      {
        field: "updatedAt",
        headerName: "Updated At",
        width: 200,
        valueGetter: (row) => formatTimeStamp(row),
      },
      {
        field: "actions",
        headerName: "Actions",
        type: "actions",
        renderCell: (params) => (
          <DataGridActions params={params} rowId={rowId} setRowId={setRowId} />
        ),
      },
    ],
    [rowId]
  );

  const { data, isError, isLoading } = useGetOrdersQuery({
    limit: paginationModel.pageSize,
    cursor: cursor,
    search: searchInputGlobal,
  });

  const { data: rows = [], nextCursor, total, hasNextPage } = data || {};

  const { data: inventoryData } = useGetInventoryQuery({
    limit: 100,
    cursor: null,
    search: "",
  });

  const { data: inventoryParts = [] } = inventoryData || {};

  const { data: productsData } = useGetProductsQuery({
    limit: 100,
    cursor: null,
    search: "",
  });

  const { data: products = [] } = productsData || {};

  const { data: customerData } = useGetCustomersQuery({
    limit: 100,
    cursor: null,
    search: "",
  });

  const { data: customers = [] } = customerData || {};

  useEffect(() => {
    if (!isLoading && nextCursor) {
      mapPageToNextCursor.current[paginationModel.page] = nextCursor;
    }
  }, [nextCursor, paginationModel.page, isLoading]);

  const paginationMetaRef = useRef();
  const paginationMeta = useMemo(() => {
    if (
      hasNextPage !== undefined &&
      paginationMetaRef.current?.hasNextPage !== hasNextPage
    ) {
      paginationMetaRef.current = { hasNextPage };
    }
    return paginationMetaRef.current;
  }, [hasNextPage]);

  const handlePaginationModelChange = (newPaginationModel) => {
    setCursor(
      newPaginationModel.page === 0
        ? null
        : JSON.stringify(
            mapPageToNextCursor.current[newPaginationModel.page - 1] || {}
          )
    );
    setPaginationModel(newPaginationModel);
  };

  const processRowUpdate = async (newRow) => {
    setRowId(newRow.orderId);
    return newRow;
  };

  useEffect(() => {
    if (total) {
      setRowCountState(total);
    }
  }, [total]);

  const handleCellEditStart = (params) => {
    setRowId(params.id);
  };

  const handleCellEditStop = () => {
    setRowId(null);
  };

  const handleSelectionChange = (newSelectionModel) =>
    setSelectedRows(newSelectionModel);

  useEffect(() => {
    setSelectedRowsCount(selectedRows.length);
  }, [selectedRows]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setOrderParts([{ partId: null, quantity: 1 }]);
    setOrderProducts([
      { productId: null, quantity: 1, bom: null, productName: "" },
    ]);
    setFormValues({
      orderType: "",
      paymentMethod: "",
      customerId: "",
      note: "",
    });
  };

  return (
    <div>
      <NestedNavbar
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={tabs}
      />
      {isLoading && <div className="py-4">Loading...</div>}
      {isError && (
        <div className="text-center text-red-500 py-4">
          Failed to fetch orders
        </div>
      )}
      {!isLoading && !isError && (
        <div>
          <DataGrid
            className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
            rows={rows}
            columns={columns}
            pageSize={PAGE_SIZE}
            paginationMode="server"
            rowCount={rowCountState}
            onRowCountChange={(newRowCount) => setRowCountState(newRowCount)}
            paginationModel={paginationModel}
            paginationMeta={paginationMeta}
            pageSizeOptions={[PAGE_SIZE]}
            loading={isLoading}
            getRowId={(row) => row.orderId}
            onPaginationModelChange={handlePaginationModelChange}
            processRowUpdate={processRowUpdate}
            onCellEditStart={handleCellEditStart}
            onCellEditStop={handleCellEditStop}
            onRowSelectionModelChange={handleSelectionChange}
            experimentalFeatures={{ newEditingApi: true }}
            checkboxSelection
            rowSelectionModel={selectedRows}
          />
          <div className="flex flex-row w-full gap-3">
            <button
              onClick={() => setOpenModal((prev) => !prev)}
              className="w-56 mt-2 flex items-center justify-center rounded-sm bg-gray-200 hover:bg-blue-100 gap-3 cursor-pointer"
            >
              <PlusSquare size={16} />
              <span className="font-semibold text-lg mr-2">Create Order</span>
            </button>
            <button
              key={selectedRowsCount}
              onClick={() => {}}
              disabled={selectedRowsCount < 1}
              className={`${
                selectedRowsCount < 1
                  ? `opacity-50`
                  : `opacity-100 hover:bg-blue-100  cursor-pointer`
              } w-56 mt-2 flex items-center justify-center rounded-sm bg-gray-200 gap-3`}
            >
              <Trash size={16} />
              <span className="font-semibold text-lg mr-2">{`Delete ${
                selectedRowsCount < 1
                  ? `order(s)`
                  : `${
                      selectedRowsCount === 1
                        ? `${selectedRowsCount} order`
                        : `${selectedRowsCount} orders`
                    }`
              }`}</span>
            </button>
          </div>
        </div>
      )}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="create-order"
      >
        <div
          onClick={handleCloseModal}
          className="flex items-center justify-center h-screen"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-1 gap-8 bg-white p-8 rounded-lg shadow-lg w-[600px] max-w-full"
            style={{ maxHeight: "90vh" }}
          >
            <h2 className="text-2xl font-semibold mb-2">Create Order</h2>

            <form onSubmit={() => {}} className="space-y-8">
              <Autocomplete
                options={ORDER_TYPE}
                value={formValues.orderType}
                onChange={(e, newValue) =>
                  setFormValues((prev) => ({
                    ...prev,
                    orderType: newValue,
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Order Type" required />
                )}
                sx={{ width: 300 }}
              />

              {formValues.orderType === "STOCK" && (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4">
                      Update Stock
                    </h3>
                    {orderParts.map((item, index) => {
                      const selectedPart = inventoryParts.find(
                        (part) => part.partId === item.partId
                      );

                      return (
                        <div
                          key={index}
                          className="flex flex-row gap-3 items-center mb-6"
                        >
                          <Autocomplete
                            options={inventoryParts.filter(
                              (part) =>
                                !orderParts.some(
                                  (orderPart) =>
                                    orderPart.partId === part.partId
                                )
                            )}
                            getOptionLabel={(part) => part.partName}
                            value={selectedPart || null}
                            onChange={(e, newValue) =>
                              handlePartSelection(index, newValue)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Inventory Part"
                                placeholder="Search for a part"
                              />
                            )}
                            sx={{ width: 300 }}
                          />

                          <TextField
                            type="number"
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handlePartQuantityChange(index, e.target.value)
                            }
                            sx={{ width: 100 }}
                          />

                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemovePart(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddPart}
                      className="mb-6"
                    >
                      Add part
                    </Button>
                  </div>

                  <TextField
                    label="Notes"
                    value={formValues.note}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        note: e.target.value,
                      })
                    }
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ width: "100%" }}
                  />

                  <div className="flex justify-end mt-8">
                    <Button
                      // disabled={!canSubmitNewProductForm}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Submit Order
                    </Button>
                  </div>
                </div>
              )}
              {formValues.orderType === "SALE" && (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4">
                      Order Details
                    </h3>

                    {/* Parts Section */}
                    {orderParts.map((item, index) => {
                      const selectedPart = inventoryParts.find(
                        (part) => part.partId === item.partId
                      );

                      return (
                        <div
                          key={index}
                          className="flex flex-row gap-3 items-center mb-6"
                        >
                          <Autocomplete
                            options={inventoryParts.filter(
                              (part) =>
                                !orderParts.some(
                                  (orderPart) =>
                                    orderPart.partId === part.partId
                                )
                            )}
                            getOptionLabel={(part) => part.partName}
                            value={selectedPart || null}
                            onChange={(e, newValue) =>
                              handlePartSelection(index, newValue)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Inventory Part"
                                placeholder="Search for a part"
                              />
                            )}
                            sx={{ width: 300 }}
                          />

                          <TextField
                            type="number"
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handlePartQuantityChange(index, e.target.value)
                            }
                            sx={{ width: 100 }}
                          />

                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemovePart(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddPart}
                      sx={{ mb: 4, mr: 2 }}
                    >
                      Add part
                    </Button>

                    {/* Products Section */}
                    {orderProducts.map((orderProduct, index) => {
                      const selectedProduct = products.find(
                        (product) =>
                          product.productId === orderProduct.productId
                      );

                      // Check if the BOM exists and has parts, otherwise do not render the product
                      return (
                        <div
                          key={index}
                          className="flex flex-row gap-3 items-center mb-6"
                        >
                          <Autocomplete
                            options={products.filter(
                              (product) =>
                                !orderProducts.some(
                                  (orderProduct) =>
                                    orderProduct.productId === product.productId
                                )
                            )}
                            getOptionLabel={(product) => product.productName}
                            value={selectedProduct || null}
                            onChange={(e, newValue) =>
                              handleProductSelection(index, newValue)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Product"
                                placeholder="Search for a product"
                              />
                            )}
                            sx={{ width: 300 }}
                          />

                          <TextField
                            type="number"
                            label="Quantity"
                            value={orderProduct.quantity}
                            onChange={(e) =>
                              handleProductQuantityChange(index, e.target.value)
                            }
                            sx={{ width: 100 }}
                          />

                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddProduct}
                      sx={{ mb: 4 }}
                    >
                      Add product
                    </Button>

                    {/* Modifications Section */}
                    {orderProducts.some(
                      (product) =>
                        product.productName &&
                        product.bom &&
                        product.bom.length > 0
                    ) && (
                      <>
                        <h3 className="text-2xl font-semibold mb-4">
                          Modifications
                        </h3>

                        {orderProducts.map((product, productIndex) => {
                          if (
                            product.productName &&
                            product.bom &&
                            product.bom.length > 0
                          ) {
                            return (
                              <div key={product.productId} className="mb-6">
                                <h4 className="text-xl font-semibold mb-2">
                                  {`${product.productName} - (BOM)`}
                                </h4>

                                <TableContainer component={Paper}>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Part ID</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Action</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {product.bom.map((item, index) => (
                                        <TableRow key={item.partId}>
                                          <TableCell>{item.partId}</TableCell>
                                          <TableCell>
                                            <TextField
                                              type="number"
                                              defaultValue={item.quantity}
                                              sx={{ width: 100 }}
                                              onChange={(e) =>
                                                handleBomModification(
                                                  productIndex,
                                                  item.partId,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              onClick={() =>
                                                handleRemoveBomPart(
                                                  productIndex,
                                                  item.partId
                                                )
                                              }
                                            >
                                              Remove
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </>
                    )}

                    {/* Customer Section */}
                    {formValues.orderType === "SALE" && (
                      <>
                        <h3 className="text-2xl font-semibold mb-4">
                          Customer Details
                        </h3>
                        <Autocomplete
                          options={customers}
                          getOptionLabel={(customer) => customer.companyName}
                          onChange={(e, newValue) => {
                            if (newValue) {
                              setFormValues((prev) => ({
                                ...prev,
                                customerId: newValue.customerId,
                              }));
                              setCustomerDetails({
                                address: newValue.address,
                                email: newValue.email,
                                phoneNumber: newValue.phoneNumber,
                                ssmNumber: newValue.ssmNumber,
                                postCode: newValue.postCode
                              });
                            } else {
                              setFormValues((prev) => ({
                                ...prev,
                                customerId: null,
                              }));
                              setCustomerDetails({
                                address: "",
                                email: "",
                                phoneNumber: "",
                                ssmNumber: "",
                                postCode: ""
                              });
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Customer"
                              required
                            />
                          )}
                          sx={{ width: "100%" }}
                        />
                        <div className="flex flex-col py-4 gap-4">
                          {formValues.customerId && (
                            <>
                              <TextField
                                label="Address"
                                value={customerDetails.address}
                                sx={{ width: "100%" }}
                                multiline
                              />
                              <div className="flex flex-row justify-between gap-3">
                                <TextField
                                  label="Phone Number"
                                  value={customerDetails.phoneNumber}
                                  sx={{ width: "100%" }}
                                />
                                <TextField
                                  label="SSM Number"
                                  value={customerDetails.ssmNumber}
                                  sx={{ width: "100%" }}
                                />
                              </div>
                              <div className="flex flex-row justify-between gap-3">
                                <TextField
                                  label="Post Code"
                                  value={customerDetails.postCode}
                                  sx={{ width: "100%" }}
                                  multiline
                                />
                                <TextField
                                  label="Email"
                                  value={customerDetails.email}
                                  sx={{ width: "100%" }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Notes and Submit */}
                    <h3 className="text-2xl font-semibold mb-4">
                          Comments
                        </h3>

                    <TextField
                      label="Write a comment"
                      value={formValues.note}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          note: e.target.value,
                        })
                      }
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />

                    <div className="flex justify-end mt-8">
                      <Button
                        // disabled={!canSubmitNewProductForm}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Submit Order
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
