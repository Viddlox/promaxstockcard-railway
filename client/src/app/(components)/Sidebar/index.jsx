"use client";

import { Archive, Clipboard, Layout, Menu, Receipt, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        } hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? "bg-blue-200 text-white" : ""
        }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />
        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-88 md:w-72"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 px-6`}
      >
        <h1
          className={`font-extrabold text-2xl ${
            isSidebarCollapsed ? "hidden" : "block"
          }`}
        >
          PROMAXSTOCK
        </h1>
        <button
          onClick={toggleSidebar}
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow mt-8">
        <SidebarLink
          href={"/dashboard"}
          icon={Layout}
          label={"Dashboard"}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href={"/products"}
          icon={Clipboard}
          label={"Products"}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href={"/inventory"}
          icon={Archive}
          label={"Inventory"}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href={"/sales"}
          icon={Receipt}
          label={"Sales & Orders"}
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href={"/users"}
          icon={User}
          label={"Users"}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div>
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 Promaxstock
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
