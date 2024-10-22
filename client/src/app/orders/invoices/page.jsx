"use client"

import { useState } from "react";
import { NestedNavbar } from "@/app/(components)/NestedNavbar";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  const tabs = [
    { id: "orders", label: "Orders", href: "/orders" },
    { id: "invoices", label: "Invoices", href: "/orders/invoices" },
  ];

  return (
    <div>
      <NestedNavbar 
        setActiveTab={setActiveTab} 
        activeTab={activeTab} 
        tabs={tabs} 
      />
    </div>
  );
};

export default Invoices;
