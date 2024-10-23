"use client";

import CardTopProducts from "@/app/(components)/CardTopProducts";
import CardSalesSummary from "@/app/(components)/CardSalesSummary";
import CardInventorySummary from "@/app/(components)/CardInventorySummary";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
      <CardTopProducts />
      <CardSalesSummary />
      <CardInventorySummary />
    </div>
  );
};

export default Dashboard;
