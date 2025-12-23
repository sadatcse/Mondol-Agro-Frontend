// src/layouts/Sidebar.js

import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import menuItems from "./MenuItems";

// 💡 Import both logo versions
import Logo from "../../assets/Logo/logo.png";
import Logo_Dark from "../../assets/Logo/logo_dark.png"; 


const AccordionItem = ({ item, isSidebarOpen, mode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();


    const getLinkClasses = (path) => {
        const baseClasses = "flex p-3 my-1 rounded-md gap-3 items-center transition-colors";

        // ✅ REINSTATED DARK MODE HOVER/TEXT
        // Text is base-content (light) or gray-300 (dark). Hover is base-content/10 (light) or gray-700 (dark).
        const textHoverClasses = "text-base-content dark:text-gray-300 hover:bg-base-content/10 dark:hover:bg-gray-700";
        
        if (location.pathname === path) {
            // Active link uses primary (your green)
            return `bg-primary text-white ${baseClasses}`;
        }
        
        return `${textHoverClasses} ${baseClasses}`;
    };

    if (item.list) {
        return (
            <li className="my-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    // ✅ REINSTATED DARK MODE HOVER/TEXT
                    className="w-full flex justify-between items-center p-3 rounded-md text-base-content dark:text-gray-300 hover:bg-base-content/10 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {item.icon}
                        {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                    </div>
                    {isSidebarOpen && <MdChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                </button>
                {isOpen && isSidebarOpen && (
                    <ul className="pl-6 pt-1">
                        {item.list.map((child) => (
                            <li key={child.title}>
                                <Link
                                    to={child.path}
                                    className={`flex p-2 my-1 text-sm rounded-md gap-3 items-center transition-colors ${
                                        location.pathname === child.path
                                            ? "bg-primary text-white"
                                            // ✅ REINSTATED DARK MODE HOVER/TEXT
                                            : "text-base-content/70 dark:text-gray-400 hover:bg-base-content/10 dark:hover:bg-gray-700"
                                    }`}
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
    } else {
        return (
            <li>
                <Link
                    to={item.path}
                    className={getLinkClasses(item.path)}
                >
                    {item.icon}
                    {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                </Link>
            </li>
        );
    }
};


const Sidebar = ({ isSidebarOpen, toggleSidebar, mode }) => {
    
    // ✅ FIX: Use base-100 for light mode, and dark:bg-gray-800 for explicit dark mode background
    const sidebarClasses = `
        fixed top-0 left-0 h-full shadow-lg z-30 transition-all duration-300 flex flex-col
        bg-base-100 dark:bg-gray-800 
        ${isSidebarOpen
            ? 'w-64 translate-x-0' 
            : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }
    `;

    // 💡 LOGIC FOR DYNAMIC LOGO SWITCHING
    const currentLogo = mode === 'dark' ? Logo_Dark : Logo;


    return (
        <>
            {/* Mobile Overlay: Appears when the sidebar is open on mobile */}
            <div
                onClick={toggleSidebar}
                className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            ></div>

            {/* Sidebar Container */}
            <div
                className={sidebarClasses} 
            >
           
                <div className={`flex items-center justify-center p-8 border-b h-[65px] flex-shrink-0 my-5 transition-colors duration-300 
                    // ✅ REINSTATED DARK MODE BORDER COLOR
                    border-base-content/10 dark:border-gray-700 
                `}>
                    {/* 💡 Use the dynamically selected logo based on the 'mode' state */}
                    <img src={currentLogo} alt="Logo" className={`transition-all duration-300 ${isSidebarOpen ? 'w-24' : 'w-10'}`} />
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto p-2">
                    <ul>
                        {menuItems().map((item) => (
                            <AccordionItem 
                                key={item.title} 
                                item={item} 
                                isSidebarOpen={isSidebarOpen} 
                                mode={mode} 
                            />
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;