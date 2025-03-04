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
    // Only apply dark mode if we're not on the login page
    if (pathname !== "/login") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    } else {
      // Always set light mode for login page
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, pathname]);

  // Handle authentication
  useEffect(() => {
    // If we're on the login page, don't redirect
    if (pathname === "/login") {
      return;
    }

    // If no access token, redirect to login
    if (!accessToken) {
      router.push("/login");
      return;
    }

    // If we have an access token but it's invalid (401), the baseQueryWithReauth
    // will handle the refresh attempt and logout if needed
  }, [accessToken, pathname, router]);

  // Don't render the dashboard layout for the login page
  if (pathname === "/login") {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className={`flex bg-gray-50 text-gray-900 w-full min-h-screen ${isDarkMode ? 'dark' : ''}`}>
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
