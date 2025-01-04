"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  useGetInventoryQuery,
  useCreateInventoryPartMutation,
  useDeleteInventoryPartsMutation,
} from "@/state/api";
import { DataGrid } from "@mui/x-data-grid";
import { Trash, PlusSquare } from "lucide-react";
import { Modal, TextField, Button } from "@mui/material";

import DataGridActions from "@/app/(components)/DataGridActions";
import Header from "@/app/(components)/Header";

import { formatTimeStamp } from "@/app/(utils)/date";
import { useAppSelector } from "@/app/redux";

const PAGE_SIZE = 10;

const Inventory = () => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [cursor, setCursor] = useState(null);
  const [rowCountState, setRowCountState] = useState(0);
  const mapPageToNextCursor = useRef({});
  const [rowId, setRowId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [canSubmitModalForm, setCanSubmitModalForm] = useState(false);
  const [formValues, setFormValues] = useState({
    partId: "",
    partName: "",
    partQuantity: "",
    partPrice: "",
    partUoM: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  const [createInventoryPart] = useCreateInventoryPartMutation();
  const [deleteInventoryParts] = useDeleteInventoryPartsMutation();

  const searchInputGlobal = useAppSelector((state) => state.global.searchInput);

  const columns = useMemo(
    () => [
      { field: "partId", headerName: "ID", width: 88 },
      { field: "partName", headerName: "Name", width: 200, editable: true },
      {
        field: "partQuantity",
        headerName: "Quantity",
        width: 150,
        editable: true,
      },
      { field: "partPrice", headerName: "Price", width: 104, editable: true },
      {
        field: "partUoM",
        headerName: "Unit of Measurement",
        width: 200,
        editable: true,
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

  const { data, isError, isLoading } = useGetInventoryQuery({
    limit: paginationModel.pageSize,
    cursor: cursor,
    search: searchInputGlobal,
  });

  const { data: rows = [], nextCursor, total, hasNextPage } = data || {};

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
    setRowId(newRow.partId);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  useEffect(() => {
    const { partId, partName, partQuantity, partPrice, partUoM } = formValues;

    if (partId && partName && partQuantity && partPrice && partUoM) {
      setCanSubmitModalForm(true);
    } else {
      setCanSubmitModalForm(false);
    }
  }, [formValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createInventoryPart(formValues);
    setOpenModal(false);
    setFormValues({
      partId: "",
      partName: "",
      partQuantity: "",
      partPrice: "",
      partUoM: "",
    });
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleSelectionChange = (newSelectionModel) =>
    setSelectedRows(newSelectionModel);

  useEffect(() => {
    setSelectedRowsCount(selectedRows.length);
  }, [selectedRows]);

  const handleDeleteInventoryParts = async () => {
    await deleteInventoryParts({ partIds: selectedRows });
    setSelectedRows([]);
  };

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch inventory
      </div>
    );

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
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
        pageSize={PAGE_SIZE}
        paginationMode="server"
        rowCount={rowCountState}
        onRowCountChange={(newRowCount) => setRowCountState(newRowCount)}
        paginationModel={paginationModel}
        paginationMeta={paginationMeta}
        pageSizeOptions={[PAGE_SIZE]}
        loading={isLoading}
        getRowId={(row) => row.partId}
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
          <span className="font-semibold text-lg mr-2">Add Item</span>
        </button>
        <button
          key={selectedRowsCount}
          onClick={handleDeleteInventoryParts}
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
        aria-labelledby="add-inventory-item"
      >
        <div
          onClick={handleCloseModal}
          className="flex items-center justify-center h-screen"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-lg shadow-lg w-96"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Inventory Item
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Part ID"
                name="partId"
                value={formValues.partId}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Part Name"
                name="partName"
                value={formValues.partName}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Quantity"
                name="partQuantity"
                value={formValues.partQuantity}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Price"
                name="partPrice"
                value={formValues.partPrice}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Unit of Measurement"
                name="partUoM"
                value={formValues.partUoM}
                onChange={handleInputChange}
                required
              />
              <div className="flex justify-end mt-4">
                <Button
                  disabled={!canSubmitModalForm}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
