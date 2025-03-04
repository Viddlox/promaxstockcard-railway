"use client";

import { Bell, Menu, Moon, Search, Sun, UserCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import {
  setIsDarkMode,
  setIsSidebarCollapsed,
  setSearchInput as setSearchInputGlobal,
  logoutUser,
} from "@/state";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSignOutMutation } from "@/state/api";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [signOut] = useSignOutMutation();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const searchInputGlobal = useAppSelector((state) => state.global.searchInput);
  const userId = useAppSelector((state) => state.global.userId);
  const refreshToken = useAppSelector((state) => state.global.refreshToken);

  const [searchInputLocal, setSearchInputLocal] = useState(searchInputGlobal);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add ref for the dropdown container
  const dropdownRef = useRef(null);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleSearch = (e) => {
    setSearchInputLocal(e.target.value);
  };

  useEffect(() => {
    const searchHandler = setTimeout(() => {
      if (searchInputLocal !== searchInputGlobal) {
        dispatch(setSearchInputGlobal(searchInputLocal));
      }
    }, 500);

    return () => {
      clearTimeout(searchHandler);
    };
  }, [searchInputLocal, searchInputGlobal, dispatch]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ userId, refreshToken }).unwrap();
      dispatch(logoutUser());
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="relative">
          <input
            type="search"
            onChange={handleSearch}
            value={searchInputLocal}
            placeholder="Search inventory & products"
            className="pl-10 pr-4 py-2 w-72 md:w-72 lg:w-80 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <div className="pl-7">
            <button onClick={toggleDarkMode}>
              {!isDarkMode ? (
                <Moon className="cursor-pointer text-gray-500" size={24} />
              ) : (
                <Sun className="cursor-pointer text-gray-500" size={24} />
              )}
            </button>
          </div>

          <div className="relative">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span
              className={`absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none bg-red-400 rounded-full ${
                !isDarkMode ? "text-red-100" : "text-black"
              }`}
            >
              3
            </span>
          </div>
          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <span className="text-sm font-medium">A</span>
              </div>
              <span className="font-semibold">Admin</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile navigation
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
