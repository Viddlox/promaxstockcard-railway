"use client";

import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppDispatch, useAppSelector } from "@/app/redux";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initializeState } from "@/state";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const accessToken = useAppSelector((state) => state.global.accessToken);

  // Initialize state from localStorage after mounting
  useEffect(() => {
    dispatch(initializeState());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Handle authentication
  useEffect(() => {
    if (!accessToken && pathname !== "/login") {
      router.push("/login");
    }
  }, [accessToken, pathname, router]);

  // Don't render the dashboard layout for the login page
  if (pathname === "/login") {
    return children;
  }

  return (
    <div
      className={`${
        isDarkMode ? "dark" : "light"
      } flex bg-gray-50 text-gray-900 w-full min-h-screen`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
          isSidebarCollapsed ? `md:pl-24` : `md:pl-80`
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
