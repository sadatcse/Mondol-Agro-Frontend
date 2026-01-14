import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import menuItems from "./MenuItems";

import Logo from "../../assets/Logo/logo.png";
import Logo_Dark from "../../assets/Logo/logo_dark.png";

const AccordionItem = ({ item, isSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Auto-open submenu if route matches
  useEffect(() => {
    if (item.children) {
      const active = item.children.some(
        (child) => child.path === location.pathname
      );
      setIsOpen(active);
    }
  }, [location.pathname, item.children]);

  const linkClass = (path) =>
    location.pathname === path
      ? "bg-primary text-white"
      : "text-base-content dark:text-gray-300 hover:bg-base-content/10 dark:hover:bg-gray-700";

  if (item.children) {
    return (
      <li className="my-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-3 rounded-md 
          text-base-content dark:text-gray-300 hover:bg-base-content/10 
          dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {isSidebarOpen && (
              <span className="font-medium text-sm">{item.title}</span>
            )}
          </div>

          {isSidebarOpen && (
            <MdChevronRight
              className={`transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          )}
        </button>

        {isOpen && isSidebarOpen && (
          <ul className="pl-6">
            {item.children.map((child) => (
              <li key={child.title}>
                <Link
                  to={child.path}
                  className={`flex items-center gap-3 p-2 my-1 text-sm rounded-md transition-colors ${linkClass(
                    child.path
                  )}`}
                >
                  {child.icon}
                  <span>{child.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={item.path}
        className={`flex items-center gap-3 p-3 my-1 rounded-md transition-colors ${linkClass(
          item.path
        )}`}
      >
        {item.icon}
        {isSidebarOpen && (
          <span className="font-medium text-sm">{item.title}</span>
        )}
      </Link>
    </li>
  );
};

const Sidebar = ({ isSidebarOpen, toggleSidebar, mode }) => {
  const logo = mode === "dark" ? Logo_Dark : Logo;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/50 z-20 md:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 shadow-lg transition-all duration-300
        bg-base-100 dark:bg-gray-800
        ${
          isSidebarOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full md:w-20 md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-[65px] flex items-center justify-center border-b border-base-content/10 dark:border-gray-700">
          <img
            src={logo}
            alt="Logo"
            className={`transition-all ${isSidebarOpen ? "w-24" : "w-10"}`}
          />
        </div>

        {/* Menu */}
        <nav className="p-2 overflow-y-auto">
          <ul>
            {menuItems().map((item) => (
              <AccordionItem
                key={item.title}
                item={item}
                isSidebarOpen={isSidebarOpen}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
