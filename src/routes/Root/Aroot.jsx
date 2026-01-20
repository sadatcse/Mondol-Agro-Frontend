// src/layouts/ARoot.js

import React, { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "../../components/Header"; // Adjusted path based on your snippet
import useThemeMode from "../../Hook/useThemeMode";

const ARoot = () => {
  const { mode } = useThemeMode();

  // Initialize based on screen width
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // ⚡ Optimization: Memoize the toggle function to prevent child re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // ⚡ Optimization: Handle resize efficiently
  useEffect(() => {
    const handleResize = () => {
      // Only auto-collapse on mobile, auto-open on desktop
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // 💡 1. Use 'dark:' utility classes instead of JS logic for backgrounds
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        mode={mode}
      />

      {/* Content Wrapper */}
      {/* 💡 2. Dynamic margin handles the layout shift */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ARoot;