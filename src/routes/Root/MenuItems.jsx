import React from "react";
import {
  MdHome,
  MdGroup,
  MdAttachMoney,
  MdBusiness,
  MdWork,
  MdAssignment,
  MdLocalShipping,
  MdPeople,
  MdAssessment,
  MdSettings,
  MdBadge,
  MdEventAvailable,
  MdEventBusy,
  MdPayments,
  MdListAlt,
  MdApartment,
  MdWorkOutline,
  MdBeachAccess,
  MdAccountBalanceWallet,
  // New Icons for Office Section
  MdPerson,
  MdFolderShared,
  MdAccessTime,
  MdContactPage,
  MdReceiptLong,
  MdShowChart,
  MdTrendingUp,
  MdAccountBalance,
  MdInventory,
  MdSwapHoriz,
  MdWarehouse
} from "react-icons/md";

const menuItems = () => {
  return [
    // ================= DASHBOARD =================
    {
      title: "Dashboard",
      path: "/dashboard/home",
      icon: <MdHome className="text-lg" />,
    },

    // ================= OFFICE MANAGEMENT (New Routes) =================
    {
      title: "My Office",
      icon: <MdBusiness className="text-lg" />,
      children: [
        {
          title: "My Profile",
          path: "/dashboard/office/profile",
          icon: <MdPerson className="text-base" />,
        },
        {
          title: "Attendance",
          path: "/dashboard/office/attendence",
          icon: <MdEventAvailable className="text-base" />,
        },
        {
          title: "Timesheet",
          path: "/dashboard/office/timesheet",
          icon: <MdAccessTime className="text-base" />,
        },
        {
          title: "Directory",
          path: "/dashboard/office/directory",
          icon: <MdContactPage className="text-base" />,
        },
        {
          title: "Documents/Papers",
          path: "/dashboard/office/papers",
          icon: <MdFolderShared className="text-base" />,
        },
      ],
    },

     {
      title: "Finance & Accounting",
      icon: <MdAccountBalance className="text-lg" />,
      children: [
        {
          title: "Chart of Accounts",
          path: "/dashboard/finance/chart-of-accounts",
          icon: <MdListAlt className="text-base" />,
        },
        {
          title: "Capital",
          path: "/dashboard/finance/capital",
          icon: <MdTrendingUp className="text-base" />,
        },
        {
          title: "Loans",
          path: "/dashboard/finance/loans",
          icon: <MdReceiptLong className="text-base" />,
        },
        {
          title: "Profit & Loss",
          path: "/dashboard/finance/profit-loss",
          icon: <MdShowChart className="text-base" />,
        },
        {
          title: "Balance Sheet",
          path: "/dashboard/finance/balance-sheet",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
        {
          title: "Cash Flow",
          path: "/dashboard/finance/cash-flow",
          icon: <MdAttachMoney className="text-base" />,
        },
      ],
    },

    // ================= CASH =================
    {
      title: "Cash In",
      path: "/dashboard/cashIn",
      icon: <MdAttachMoney className="text-lg" />,
    },
    {
      title: "Cash Out",
      path: "/dashboard/cashout",
      icon: <MdAttachMoney className="text-lg" />,
    },

    // ================= COMPANY =================

        {
      title: "Company Management",
      icon: <MdBusiness className="text-lg" />,
      children: [
        {
          title: "Company Details",
          path: "/dashboard/company",
          icon: <MdApartment className="text-base" />,
        },
        {
          title: "Company Balance Sheet",
          path: "/dashboard/company/balance-sheet",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
        {
          title: "Expense Report",
          path: "/dashboard/company/expenses",
          icon: <MdAttachMoney className="text-base" />,
        },
        {
          title: "Purchase Report",
          path: "/dashboard/company/purchases",
          icon: <MdReceiptLong className="text-base" />,
        },
      ],
    },
    

    // ================= EMPLOYEE (HR/Admin Side) =================
    {
      title: "Employee",
      icon: <MdWork className="text-lg" />,
      children: [
        {
          title: "Employee Profile",
          path: "/dashboard/employee",
          icon: <MdBadge className="text-base" />,
        },
        {
          title: "Employee Attendance",
          path: "/dashboard/employee/attendance",
          icon: <MdEventAvailable className="text-base" />,
        },
        {
          title: "Employee Leaves",
          path: "/dashboard/employee/leaves",
          icon: <MdEventBusy className="text-base" />,
        },
        {
          title: "Employee Payroll",
          path: "/dashboard/employee/payroll",
          icon: <MdPayments className="text-base" />,
        },
        {
          title: "Employee Panel Access",
          path: "/dashboard/users",
          icon: <MdGroup className="text-lg" />,
        },
        {
          title: "Employee Letters (AI)",
          path: "/dashboard/hr/letters",
          icon: <MdFolderShared className="text-base" />,
        },
        {
          title: "Annual Performance Evaluation",
          path: "/dashboard/hr/performance",
          icon: <MdAssessment className="text-base" />,
        },
        {
          title: "Employee Salary Transfer",
          path: "/dashboard/hr/salary-transfer",
          icon: <MdPayments className="text-base" />,
        },
      ],
    },

    // ================= PROJECT =================

        {
      title: "Projects",
      icon: <MdAssignment className="text-lg" />,
      children: [
        {
          title: "Project List",
          path: "/dashboard/project",
          icon: <MdListAlt className="text-base" />,
        },
        {
          title: "Project Payments",
          path: "/dashboard/projects/payments",
          icon: <MdPayments className="text-base" />,
        },
        {
          title: "Project Ledger",
          path: "/dashboard/projects/ledger",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
      ],
    },

    // ================= VENDOR =================

        {
      title: "Vendors",
      icon: <MdLocalShipping className="text-lg" />,
      children: [
        {
          title: "Vendor List",
          path: "/dashboard/vendor",
          icon: <MdPeople className="text-base" />,
        },
        {
          title: "Vendor Purchases",
          path: "/dashboard/vendors/purchases",
          icon: <MdReceiptLong className="text-base" />,
        },
        {
          title: "Vendor Payments",
          path: "/dashboard/vendors/payments",
          icon: <MdPayments className="text-base" />,
        },
        {
          title: "Vendor Ledger",
          path: "/dashboard/vendors/ledger",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
      ],
    },

    // ================= CLIENT =================
   {
      title: "Clients",
      icon: <MdPeople className="text-lg" />,
      children: [
        {
          title: "Client List",
          path: "/dashboard/clients",
          icon: <MdPerson className="text-base" />,
        },
        {
          title: "Client Payments",
          path: "/dashboard/clients/payments",
          icon: <MdPayments className="text-base" />,
        },
        {
          title: "Client Ledger",
          path: "/dashboard/clients/ledger",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
      ],
    },

        {
      title: "Inventory & Stock",
      icon: <MdInventory className="text-lg" />,
      children: [
        {
          title: "Stock Overview",
          path: "/dashboard/inventory",
          icon: <MdInventory className="text-base" />,
        },
        {
          title: "Stock Transfers",
          path: "/dashboard/inventory/transfers",
          icon: <MdSwapHoriz className="text-base" />,
        },
        {
          title: "Warehouses",
          path: "/dashboard/inventory/warehouses",
          icon: <MdWarehouse className="text-base" />,
        },
      ],
    },

    // ================= REPORT =================
    {
      title: "Report",
      icon: <MdAssessment className="text-lg" />,
      children: [
        {
          title: "Employee Directory",
          path: "/dashboard/report/employee-directory",
          icon: <MdListAlt className="text-base" />,
        },
        {
          title: "Attendance Report",
          path: "/dashboard/report/attendance",
          icon: <MdEventAvailable className="text-base" />,
        },
        {
          title: "Payroll Summary",
          path: "/dashboard/report/payroll",
          icon: <MdAccountBalanceWallet className="text-base" />,
        },
      ],
    },

    // ================= SETTINGS =================
    {
      title: "Setting",
      icon: <MdSettings className="text-lg" />,
      children: [
        {
          title: "Departments",
          path: "/dashboard/settings/departments",
          icon: <MdApartment className="text-base" />,
        },
        {
          title: "Designations",
          path: "/dashboard/settings/designations",
          icon: <MdWorkOutline className="text-base" />,
        },
        {
          title: "Leave Types",
          path: "/dashboard/settings/leave-types",
          icon: <MdBeachAccess className="text-base" />,
        },
        {
          title: "Salary Components",
          path: "/dashboard/settings/salary-components",
          icon: <MdPayments className="text-base" />,
        },
          {
          title: "User Permission",
          path: "/dashboard/setting/permission",
          icon: <MdPayments className="text-base" />,
        },
      ],
    },
  ];
};

export default menuItems;