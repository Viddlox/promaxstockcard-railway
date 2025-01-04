"use client";

import { useState } from "react";
import { NestedNavbar } from "@/app/(components)/NestedNavbar";

export default function UsersLayout({ children }) {
  const [activeTab, setActiveTab] = useState("agents");

  const tabs = [
    { id: "agents", label: "Agents", href: "/users/agents" },
    { id: "admins", label: "Admins", href: "/users/admins" },
  ];

  return (
    <div>
      <NestedNavbar
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={tabs}
      />
      <div>{children}</div>
    </div>
  );
}
