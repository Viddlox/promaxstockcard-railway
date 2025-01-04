"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  useGetProductsQuery,
  useDeleteProductsMutation,
  useGetInventoryQuery,
  useCreateInventoryPartMutation,
  useCreateProductMutation,
} from "@/state/api";
import { DataGrid } from "@mui/x-data-grid";
import { Trash, PlusSquare, Book } from "lucide-react";
import {
  Modal,
  TextField,
  Button,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import DataGridActions from "@/app/(components)/DataGridActions";
import Header from "@/app/(components)/Header";

import { formatTimeStamp } from "@/app/(utils)/date";
import { useAppSelector } from "@/app/redux";

const PAGE_SIZE_PRODUCTS = 10;
const PAGE_SIZE_INVENTORY = 100;

const Products = () => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE_PRODUCTS,
  });
  const [cursor, setCursor] = useState(null);
  const [rowCountState, setRowCountState] = useState(0);
  const mapPageToNextCursor = useRef({});
  const [rowId, setRowId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [openRowBomModal, setOpenRowBomModal] = useState(false);
  const [rowBomDetails, setRowBomDetails] = useState([]);

  const [deleteProducts] = useDeleteProductsMutation();
  const [createInventoryPart] = useCreateInventoryPartMutation();
  const [createProduct] = useCreateProductMutation();

  const searchInputGlobal = useAppSelector((state) => state.global.searchInput);

  const { data, isError, isLoading } = useGetProductsQuery({
    limit: paginationModel.pageSize,
    cursor: cursor,
    search: searchInputGlobal,
  });

  const { data: rows = [], nextCursor, total, hasNextPage } = data || {};

  const { data: inventoryData } = useGetInventoryQuery({
    limit: PAGE_SIZE_INVENTORY,
    cursor: null,
    search: "",
  });

  const { data: inventoryParts = [] } = inventoryData || {};

  const columns = useMemo(
    () => [
      { field: "productId", headerName: "ID", width: 88 },
      { field: "productName", headerName: "Name", width: 200, editable: true },
      {
        field: "quantity",
        headerName: "Quantity",
        width: 150,
        editable: true,
      },
      { field: "basePrice", headerName: "Price", width: 104, editable: true },
      {
        field: "bom",
        headerName: "BOM (Bill of Manufacturing)",
        width: 200,
        renderCell: (params) => (
          <button
            onClick={handleOpenRowBOM(params)}
            className="flex flex-row items-center gap-3 hover:text-blue-800"
          >
            <h1>View BOM details</h1>
            <Book size={16} />
          </button>
        ),
      },
      {
        field: "createdAt",
        headerName: "Created At",
        width: 200,
        valueGetter: (row) => formatTimeStamp(row),
      },
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
    setRowId(newRow.productId);
    return newRow;
  };

  useEffect(() => {
    if (total) {
      setRowCountState(total);
    }
  }, [total]);

  useEffect(() => {
    setSelectedRowsCount(selectedRows.length);
  }, [selectedRows]);

  const handleCellEditStart = (params) => {
    setRowId(params.id);
  };

  const handleCellEditStop = () => {
    setRowId(null);
  };

  const handleSelectionChange = (newSelectionModel) =>
    setSelectedRows(newSelectionModel);

  const handleCloseRowBOM = () => {
    setOpenRowBomModal(false);
    setRowBomDetails([]);
  };

  const handleOpenRowBOM = (params) => () => {
    setOpenRowBomModal(true);
    setRowBomDetails(params.row.bom);
  };

  //MODAL FORMS

  const [openModal, setOpenModal] = useState(false);
  const [canSubmitNewProductForm, setCanSubmitNewProductForm] = useState(false);
  const [newProductFormValues, setNewProductFormValues] = useState({
    productId: "",
    productName: "",
    basePrice: "",
  });
  const [showNewPartForm, setShowNewPartForm] = useState(false);
  const [newPartFormValues, setNewPartFormValues] = useState({
    partId: "",
    partName: "",
    partQuantity: "",
    partPrice: "",
    partUoM: "",
  });
  const [canSubmitNewPartForm, setCanSubmitNewPartForm] = useState(false);

  useEffect(() => {
    const { partId, partName, partQuantity, partPrice, partUoM } =
      newPartFormValues;
    if (partId && partName && partQuantity && partPrice && partUoM) {
      setCanSubmitNewPartForm(true);
    } else {
      setCanSubmitNewPartForm(false);
    }
  }, [newPartFormValues]);

  const handleCreateNewPart = async (e) => {
    e.preventDefault();

    await createInventoryPart(newPartFormValues);
    setShowNewPartForm(false);
    setNewPartFormValues({
      partId: "",
      partName: "",
      partQuantity: "",
      partPrice: "",
      partUoM: "",
    });
  };

  const handleInputNewPart = (e) => {
    const { name, value } = e.target;
    setNewPartFormValues(() => ({
      ...newPartFormValues,
      [name]: value,
    }));
  };

  const [newProductBOM, setNewProductBOM] = useState([]);

  const handleBOMPartSelection = (index, newPart) => {
    const updatedBOM = [...newProductBOM];
    updatedBOM[index] = { ...updatedBOM[index], partId: newPart.partId };
    setNewProductBOM(updatedBOM);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedBOM = [...newProductBOM];
    updatedBOM[index] = { ...updatedBOM[index], quantity };
    setNewProductBOM(updatedBOM);
  };

  const handleAddBOMPart = () => {
    setNewProductBOM([...newProductBOM, { partId: null, quantity: 1 }]);
  };

  const handleRemoveBOMPart = (index) => {
    setNewProductBOM(newProductBOM.filter((_, i) => i !== index));
  };

  const handleInputNewProduct = (e) => {
    const { name, value } = e.target;
    setNewProductFormValues(() => ({
      ...newProductFormValues,
      [name]: value,
    }));
  };

  const handleCheckBOMParts = () => {
    if (newProductBOM.length < 1) {
      return false;
    }
    return newProductBOM.every(
      (item) => item.partId !== null && item.quantity >= 1
    );
  };

  const handleCreateNewProduct = async (e) => {
    e.preventDefault();

    const { productId, productName, basePrice } = newProductFormValues;

    await createProduct({
      productId,
      productName,
      basePrice,
      bom: newProductBOM,
    });
    setOpenModal(false);
    setNewProductFormValues({
      productId: "",
      productName: "",
      basePrice: "",
    });
    setNewProductBOM([]);
  };

  useEffect(() => {
    const { productId, productName, basePrice } = newProductFormValues;

    if (productId && productName && basePrice && handleCheckBOMParts()) {
      setCanSubmitNewProductForm(true);
    } else {
      setCanSubmitNewProductForm(false);
    }
  }, [newProductFormValues, newProductBOM]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewProductBOM([]);
  };

  const handleDeleteProducts = async () => {
    await deleteProducts({ productIds: selectedRows });
    setSelectedRows([]);
  };

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );

  return (
    <div className="flex flex-col">
      <Header name="Products" />
      <DataGrid
        sx={{
          "& .MuiDataGrid-columnSeparator": {
            color: "#d1d5db",
          },
          "& .MuiDataGrid-columnHeaders div[role='row']": {
            backgroundColor: "#f3f4f6",
          },
          "& .MuiDataGrid-checkbox": {
            color: "#4b5563",
          },
          "& .MuiCheckbox-root": {
            color: "#4b5563",
          },
          "& .MuiCheckbox-root.Mui-checked": {
            color: "#2563eb",
          },
        }}
        className="bg-white shadow rounded-lg border border-gray-200 mt-2 !text-gray-700"
        rows={rows}
        columns={columns}
        pageSize={PAGE_SIZE_PRODUCTS}
        paginationMode="server"
        rowCount={rowCountState}
        onRowCountChange={(newRowCount) => setRowCountState(newRowCount)}
        paginationModel={paginationModel}
        paginationMeta={paginationMeta}
        pageSizeOptions={[PAGE_SIZE_PRODUCTS]}
        loading={isLoading}
        getRowId={(row) => row.productId}
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
          <span className="font-semibold text-lg mr-2">Add Product</span>
        </button>
        <button
          key={selectedRowsCount}
          onClick={handleDeleteProducts}
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
              ? `item(s)`
              : `${
                  selectedRowsCount === 1
                    ? `${selectedRowsCount} item`
                    : `${selectedRowsCount} items`
                }`
          }`}</span>
        </button>
      </div>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="add-product"
      >
        <div
          onClick={handleCloseModal}
          className="flex items-center justify-center h-screen"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-2 overflow-auto gap-6 bg-white p-8 rounded-lg shadow-lg w-[600px]"
          >
            <div className="col-span-2 flex flex-col">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Add Product
              </h2>

              <form onSubmit={handleCreateNewProduct} className="space-y-4">
                <TextField
                  fullWidth
                  label="Product ID"
                  name="productId"
                  value={newProductFormValues.productId}
                  onChange={handleInputNewProduct}
                  required
                />
                <TextField
                  fullWidth
                  label="Product Name"
                  name="productName"
                  value={newProductFormValues.productName}
                  onChange={handleInputNewProduct}
                  required
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="basePrice"
                  value={newProductFormValues.basePrice}
                  onChange={handleInputNewProduct}
                  required
                />

                {/* Bill of Materials Section */}
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Bill of Materials (BOM)
                  </h3>

                  {newProductBOM.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-4 items-center">
                      <Autocomplete
                        options={inventoryParts}
                        getOptionLabel={(part) => part.partName}
                        onChange={(e, newValue) =>
                          handleBOMPartSelection(index, newValue)
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
                          handleQuantityChange(index, e.target.value)
                        }
                      />

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveBOMPart(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <div className="flex flex-row gap-2">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddBOMPart}
                    >
                      Add Part to BOM
                    </Button>

                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowNewPartForm(true)}
                    >
                      Create New Part
                    </Button>
                  </div>
                </div>

                {showNewPartForm && (
                  <div className="mt-6 flex-col flex gap-4">
                    <h4 className="text-lg font-medium mb-2">
                      Create New Part
                    </h4>

                    {/* New Part Form */}
                    <TextField
                      fullWidth
                      label="Part ID"
                      name="partId"
                      value={newPartFormValues.partId}
                      onChange={handleInputNewPart}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Part Name"
                      name="partName"
                      value={newPartFormValues.partName}
                      onChange={handleInputNewPart}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Unit Price"
                      name="partPrice"
                      value={newPartFormValues.partPrice}
                      onChange={handleInputNewPart}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Quantity"
                      name="partQuantity"
                      value={newPartFormValues.partQuantity}
                      onChange={handleInputNewPart}
                      required
                    />
                    <TextField
                      fullWidth
                      label="UOM (Unit of Measurement)"
                      name="partUoM"
                      value={newPartFormValues.partUoM}
                      onChange={handleInputNewPart}
                      required
                    />

                    <div className="flex flex-row gap-2">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateNewPart}
                        className="mt-4"
                        disabled={!canSubmitNewPartForm}
                      >
                        Create Part
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setShowNewPartForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    disabled={!canSubmitNewProductForm}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Submit Product
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={openRowBomModal}
        onClose={handleCloseRowBOM}
        aria-labelledby="row-bom-details"
      >
        <div
          onClick={handleCloseRowBOM}
          className="flex items-center justify-center h-screen"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-lg shadow-lg w-96"
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Part ID</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowBomDetails &&
                    rowBomDetails.map((item) => (
                      <TableRow key={item.partId}>
                        <TableCell>{item.partId}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
