import React from 'react';
import {
  MdHome,
  MdGroup,
  MdAttachMoney, // Used for Cash In / Cash Out
  MdBusiness, // Used for Company
  MdWork, // Used for Employee
  MdAssignment, // Used for Project
  MdLocalShipping, // Used for Vendor
  MdRemoveShoppingCart, // Alternative for Cash Out if needed, but MdAttachMoney is used for consistency
} from "react-icons/md";

const menuItems = () => {
  return [
    {
      title: "Dashboard",
      path: "/dashboard/home",
      icon: <MdHome className="text-lg" />,
    },
    {
      title: "Staff",
      path: "/dashboard/users",
      icon: <MdGroup className="text-lg" />,
    },
    {
      title: "Cash In",
      path: "/dashboard/cashIn",
      icon: <MdAttachMoney className="text-lg" />, // Cash In
    },
    {
      title: "Cash Out",
      path: "/dashboard/cashout",
      icon: <MdAttachMoney className="text-lg" />, // Cash Out (using same icon, or could use MdRemoveShoppingCart)
    },
    {
      title: "Company",
      path: "/dashboard/company",
      icon: <MdBusiness className="text-lg" />, // Company/Business
    },
    {
      title: "Employee",
      path: "/dashboard/employee",
      icon: <MdWork className="text-lg" />, // Work/Employee
    },
    {
      title: "Project",
      path: "/dashboard/project",
      icon: <MdAssignment className="text-lg" />, // Project/Assignment
    },
    {
      title: "Vendor",
      path: "/dashboard/vendor",
      icon: <MdLocalShipping className="text-lg" />, // Shipping/Vendor
    },
  ];
};

export default menuItems;