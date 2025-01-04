// import { useGetDashboardMetricsQuery } from "@/state/api";
// import { formatTimeStamp } from "@/app/(utils)/date";
// import { ShoppingBag } from "lucide-react";

// const CardTopProducts = () => {
//   const { data, isLoading } = useGetDashboardMetricsQuery();

//   const { topProductsSummaryData } = data || {};

//   const topProducts = topProductsSummaryData?.topProducts || [];

//   return (
//     <div className="bg-white shadow-md rounded-2xl pb-16 row-span-3 xl:row-span-6">
//       {isLoading ? (
//         <div className="m-5">Loading...</div>
//       ) : (
//         <>
//           <div className="flex flex-row items-center justify-between px-7 pt-5 pb-2">
//             <h3 className="text-lg font-semibold">Top Products</h3>
//             <h3 className="text-xs">
//               {formatTimeStamp(topProductsSummaryData?.createdAt)}
//             </h3>
//           </div>
//           <hr />
//           <div className="overflow-auto h-full">
//             {topProducts?.map((product) => (
//               <div
//                 key={product.productId}
//                 className="flex items-center justify-between gap-3 px-5 py-7 border-b"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex flex-col justify-between gap-1">
//                     <div className="font-bold text-gray-700">
//                       {product.productName}
//                     </div>
//                     <div className="flex text-sm items-center">
//                       <span className="font-bold text-blue-500 text-xs">
//                         RM {product.basePrice}
//                       </span>
//                       <span className="mx-2">|</span>
//                       <div className="flex flex-row items-center text-xs gap-2">
//                         <span className="font-bold text-blue-500 text-xs">
//                           Total Sold: {Math.round(product.totalSold)}
//                         </span>
//                         <button className="p-1 rounded-full bg-blue-100 text-blue-600">
//                           <ShoppingBag className="w-3 h-3" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default CardTopProducts;
