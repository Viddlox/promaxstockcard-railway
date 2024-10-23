import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardInventorySummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const inventoryData = data?.inventorySummaryData || [];
  const lastDataPoint = inventoryData[inventoryData.length - 1] || null;
  const topFewestParts = data?.topFewestPartsData || []


  return (
    <div className="flex flex-col gap-4">
      <div className="row-span-3 bg-white shadow-md rounded-2xl flex flex-col justify-between">
        {isLoading ? (
          <div className="m-5">Loading...</div>
        ) : (
          <>
            {/* HEADER */}
            <div>
              <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
                Inventory Summary
              </h2>
              <hr />
            </div>
            {/* BODY */}
            <div>
              {/* BODY HEADER */}
              <div className="mb-4 mt-7 px-7">
                <p className="text-xs text-gray-400">Inventory Levels</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">
                    {lastDataPoint.totalAmount || 0}
                  </p>
                  {lastDataPoint && (
                    <p
                      className={`text-sm ${
                        lastDataPoint.changePercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      } flex ml-3`}
                    >
                      {lastDataPoint.changePercentage >= 0 ? (
                        <TrendingUp className="w-5 h-5 mr-1" />
                      ) : (
                        <TrendingDown className="w-5 h-5 mr-1" />
                      )}
                      {Math.abs(lastDataPoint.changePercentage).toPrecision(3)}%
                    </p>
                  )}
                </div>
              </div>
              {/* CHART */}
              <ResponsiveContainer width="100%" height={200} className="p-2">
                <AreaChart
                  data={inventoryData}
                  margin={{ top: 0, right: 0, left: -50, bottom: 45 }}
                >
                  <XAxis dataKey="createdAt" tick={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    tick={false}
                    axisLine={false}
                    domain={[
                      (dataMin) => dataMin * 0.99,
                      (dataMax) => dataMax * 1.01,
                    ]}
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString("en")}`]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                  />
                  <Area
                    type="linear"
                    dataKey="totalAmount"
                    stroke="#8884d8"
                    fill="#8884d8"
                    dot={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-3 xl:col-span-1 bg-white shadow-md rounded-2xl">
        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
            Lowest Stock Items
          </h2>
          <hr />
        </div>
        {/* BODY */}
        <div className="flex flex-col p-5 gap-4">
          {topFewestParts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 rounded-lg p-3 shadow-md"
            >
              <div>
                <p className="font-semibold">{product.partName}</p>
                <p className="text-xs font-semibold text-blue-500">
                  Qty: {product.partQuantity}
                </p>
              </div>
              <div
                className={`flex items-center justify-center rounded-full w-8 h-8 ${
                  product.partQuantity <= 25
                    ? "bg-red-500"
                    : product.partQuantity <= 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              >
                <span className="text-white">{product.partQuantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardInventorySummary;
