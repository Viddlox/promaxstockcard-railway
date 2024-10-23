"use client";
import { Save, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { CircularProgress } from "@mui/material";

const DataGridActions = ({ params, rowId, setRowId }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
      setRowId(null);
    }, 2000);
  };

  return (
    <div className="relative flex flex-row">
      {success ? (
        <div
          className="bg-gray-100 rounded-full p-2 hover:bg-green-100"
          onClick={() => {}}
        >
          <Check className="text-gray-500" size={20} />
        </div>
      ) : (
        <button
          className="bg-gray-100 rounded-full p-2 hover:bg-blue-100"
          disabled={params.id !== rowId || loading}
          onClick={handleSaveClick}
        >
          <Save className="text-gray-500" size={20} />
        </button>
      )}
      <button
        className="bg-gray-100 rounded-full p-2 hover:bg-blue-100"
        onClick={() => {}}
      >
        <QrCode className="text-gray-500" size={20} />
      </button>
      {loading && (
        <CircularProgress
          size={40}
          sx={{
            color: "green",
            position: "absolute",
            top: -4,
            left: -3,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};

export default DataGridActions;
