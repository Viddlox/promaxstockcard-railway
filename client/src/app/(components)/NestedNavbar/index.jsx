"use client";

import Link from "next/link";

export const NestedNavbar = ({ setActiveTab, activeTab, tabs }) => {
  return (
    <div className="border-b-2 border-gray-300 relative">
      <nav className="flex space-x-12 relative">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative py-3 text-lg ${
              activeTab === tab.id ? "text-blue-500 font-bold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute left-0 right-0 -bottom-1 h-[1px] transform -translate-y-1 bg-blue-500"></span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};
