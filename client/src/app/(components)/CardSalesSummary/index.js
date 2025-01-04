// import { useGetDashboardMetricsQuery } from "@/state/api";
// import { TrendingUp } from "lucide-react";
// import React, { useState } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { formatTimeStamp } from "@/app/(utils)/date";

// const CardSalesSummary = () => {
//   const { data, isLoading, isError } = useGetDashboardMetricsQuery();
//   const salesData = data?.salesSummaryData || [];

//   const [timeframe, setTimeframe] = useState("weekly");

//   const averageChangePercentage =
//     salesData.reduce((acc, curr, _, array) => {
//       return acc + curr.changePercentage / array.length;
//     }, 0) || 0;

//   const highestValueData = salesData.reduce((acc, curr) => {
//     return acc.totalValue > curr.totalValue ? acc : curr;
//   }, salesData[0] || {});

//   const highestValueDate = highestValueData?.createdAt
//     ? formatTimeStamp(highestValueData.createdAt)
//     : "N/A";

//   const totalValueSum =
//     salesData.reduce((acc, curr) => acc + Number(curr.totalValue), 0) || 0;

//   if (isError) {
//     return <div className="m-5">Failed to fetch data</div>;
//   }

//   return (
//     <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
//       {isLoading ? (
//         <div className="m-5">Loading...</div>
//       ) : (
//         <>
//           {/* HEADER */}
//           <div>
//             <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
//               Sales Summary
//             </h2>
//             <hr />
//           </div>

//           {/* BODY */}
//           <div>
//             {/* BODY HEADER */}
//             <div className="flex justify-between items-center mb-6 px-7">
//               <div className="text-lg font-medium">
//                 <p className="text-xs text-gray-400">Value</p>
//                 <span className="text-2xl font-extrabold">
//                   RM
//                   {totalValueSum.toLocaleString("en", {
//                     maximumFractionDigits: 2, // Format the sum properly
//                   })}
//                 </span>

//                 <span className="text-green-500 text-sm ml-2">
//                   <TrendingUp className="inline w-4 h-4 mr-1" />
//                   {averageChangePercentage.toFixed(2)}%
//                 </span>
//               </div>
//               <select
//                 className="shadow-sm border border-gray-300 bg-white p-2 rounded"
//                 value={timeframe}
//                 onChange={(e) => {
//                   setTimeframe(e.target.value);
//                 }}
//               >
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//               </select>
//             </div>
//             {/* CHART */}
//             <ResponsiveContainer width="100%" height={350} className="px-8">
//               <BarChart
//                 data={salesData}
//                 margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
//               >
//                 <CartesianGrid strokeDasharray="" vertical={false} />
//                 <XAxis
//                   dataKey="createdAt"
//                   tickFormatter={(value) => {
//                     const date = new Date(value);
//                     return `${date.getMonth() + 1}/${date.getDate()}`;
//                   }}
//                 />
//                 <YAxis
//                   tickFormatter={(value) => `RM ${value.toFixed(0)}`}
//                   tick={{ fontSize: 12, dx: -1 }}
//                   tickLine={false}
//                   axisLine={false}
//                   domain={[
//                     0,
//                     Math.max(...salesData.map((data) => data.totalValue)) * 1.2,
//                   ]}
//                 />
//                 <Tooltip
//                   formatter={(value) => [`RM ${value.toLocaleString("en")}`]}
//                   labelFormatter={(label) => {
//                     const date = new Date(label);
//                     return date.toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     });
//                   }}
//                 />
//                 <Bar
//                   dataKey="totalValue"
//                   fill="#3182ce"
//                   barSize={10}
//                   radius={[10, 10, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* FOOTER */}
//           <div>
//             <hr />
//             <div className="flex justify-between items-center mt-6 text-sm px-7 mb-4">
//               <p>{salesData.length || 0} days</p>
//               <p className="text-sm">
//                 Highest Sales Date:{" "}
//                 <span className="font-bold">{highestValueDate}</span>
//               </p>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default CardSalesSummary;
