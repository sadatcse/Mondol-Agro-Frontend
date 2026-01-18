import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";

// ================= PAGES IMPORTS =================
import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";

// Dashboard
import Home from "../pages/Dashboard/Home";

// Office User
import Profile from "../pages/OfficeUser/Profile";
import Attendence from "../pages/OfficeUser/Attendence";
import TimeSheet from "../pages/OfficeUser/TimeSheet";
import Directory from "../pages/OfficeUser/Directory";
import Papers from "../pages/OfficeUser/Papers";

// Cash
import CashIn from "../pages/Main/CashIn";
import Cashout from "../pages/Main/Cashout";

// Company
import Company from "../pages/Main/Company";

// Employee (Main & Sub)
import Employee from "../pages/Main/Employee";
import Attendance from "../pages/Employee/Attendance";
import Leaves from "../pages/Employee/Leaves";
import Payroll from "../pages/Employee/Payroll";
import Users from "../pages/OtherPage/users"; // Panel Access

// Projects
import Project from "../pages/Main/Project";

// Vendors
import Vendor from "../pages/Main/Vendor";

// Clients
import Client from "../pages/Main/Client";

// Reports
import Employeedirectory from "../pages/Report/Employeedirectory";
import Attendancereport from "../pages/Report/Attendancereport";
import Payrollsummary from "../pages/Report/Payrollsummary";

// Settings
import Departments from "../pages/Employee/Departments";
import Designations from "../pages/Employee/Designations";
import LeaveTypes from "../pages/Employee/Leave_Types";
import SalaryComponents from "../pages/Employee/Salary_Components";
import UserPermission from "../pages/Setting/UserPermission";

// ================= TEMPORARY PLACEHOLDER =================
// Use this for routes where you haven't created the file yet
const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-2xl font-bold text-gray-500">{title} - Page Under Construction</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
    ],
  },
  {
    path: "dashboard",
    element: <Aroot />,
    errorElement: <Error404 />,
    children: [
      // Redirect root dashboard to home
      {
        path: "",
        element: (
          <PrivateRoot>
            <Navigate to="home" replace />
          </PrivateRoot>
        ),
      },

      // ================= 1. DASHBOARD =================
      {
        path: "home",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // ================= 2. MY OFFICE =================
      {
        path: "office/profile",
        element: <PrivateRoot><Profile /></PrivateRoot>,
      },
      {
        path: "office/attendence",
        element: <PrivateRoot><Attendence /></PrivateRoot>,
      },
      {
        path: "office/timesheet",
        element: <PrivateRoot><TimeSheet /></PrivateRoot>,
      },
      {
        path: "office/directory",
        element: <PrivateRoot><Directory /></PrivateRoot>,
      },
      {
        path: "office/papers",
        element: <PrivateRoot><Papers /></PrivateRoot>,
      },

      // ================= 3. FINANCE & ACCOUNTING (New) =================
      {
        path: "finance/chart-of-accounts",
        element: <PrivateRoot><ComingSoon title="Chart of Accounts" /></PrivateRoot>,
      },
      {
        path: "finance/capital",
        element: <PrivateRoot><ComingSoon title="Capital" /></PrivateRoot>,
      },
      {
        path: "finance/loans",
        element: <PrivateRoot><ComingSoon title="Loans" /></PrivateRoot>,
      },
      {
        path: "finance/profit-loss",
        element: <PrivateRoot><ComingSoon title="Profit & Loss" /></PrivateRoot>,
      },
      {
        path: "finance/balance-sheet",
        element: <PrivateRoot><ComingSoon title="Balance Sheet" /></PrivateRoot>,
      },
      {
        path: "finance/cash-flow",
        element: <PrivateRoot><ComingSoon title="Cash Flow" /></PrivateRoot>,
      },

      // ================= 4. CASH =================
      {
        path: "cashIn",
        element: <PrivateRoot><CashIn /></PrivateRoot>,
      },
      {
        path: "cashout",
        element: <PrivateRoot><Cashout /></PrivateRoot>,
      },

      // ================= 5. COMPANY MANAGEMENT =================
      {
        path: "company",
        element: <PrivateRoot><Company /></PrivateRoot>,
      },
      {
        path: "company/balance-sheet",
        element: <PrivateRoot><ComingSoon title="Company Balance Sheet" /></PrivateRoot>,
      },
      {
        path: "company/expenses",
        element: <PrivateRoot><ComingSoon title="Expense Report" /></PrivateRoot>,
      },
      {
        path: "company/purchases",
        element: <PrivateRoot><ComingSoon title="Purchase Report" /></PrivateRoot>,
      },

      // ================= 6. EMPLOYEE (HR/Admin) =================
      {
        path: "employee",
        element: <PrivateRoot><Employee /></PrivateRoot>, // Employee Profile
      },
      {
        path: "employee/attendance",
        element: <PrivateRoot><Attendance /></PrivateRoot>,
      },
      {
        path: "employee/leaves",
        element: <PrivateRoot><Leaves /></PrivateRoot>,
      },
      {
        path: "employee/payroll",
        element: <PrivateRoot><Payroll /></PrivateRoot>,
      },
      {
        path: "users",
        element: <PrivateRoot><Users /></PrivateRoot>, // Panel Access
      },
      {
        path: "hr/letters",
        element: <PrivateRoot><ComingSoon title="Employee Letters" /></PrivateRoot>,
      },
      {
        path: "hr/performance",
        element: <PrivateRoot><ComingSoon title="Performance Evaluation" /></PrivateRoot>,
      },
      {
        path: "hr/salary-transfer",
        element: <PrivateRoot><ComingSoon title="Salary Transfer" /></PrivateRoot>,
      },

      // ================= 7. PROJECT =================
      {
        path: "project",
        element: <PrivateRoot><Project /></PrivateRoot>,
      },
      {
        path: "projects/payments",
        element: <PrivateRoot><ComingSoon title="Project Payments" /></PrivateRoot>,
      },
      {
        path: "projects/ledger",
        element: <PrivateRoot><ComingSoon title="Project Ledger" /></PrivateRoot>,
      },

      // ================= 8. VENDOR =================
      {
        path: "vendor",
        element: <PrivateRoot><Vendor /></PrivateRoot>,
      },
      {
        path: "vendors/purchases",
        element: <PrivateRoot><ComingSoon title="Vendor Purchases" /></PrivateRoot>,
      },
      {
        path: "vendors/payments",
        element: <PrivateRoot><ComingSoon title="Vendor Payments" /></PrivateRoot>,
      },
      {
        path: "vendors/ledger",
        element: <PrivateRoot><ComingSoon title="Vendor Ledger" /></PrivateRoot>,
      },

      // ================= 9. CLIENT =================
      {
        path: "clients",
        element: <PrivateRoot><Client /></PrivateRoot>,
      },
      {
        path: "clients/payments",
        element: <PrivateRoot><ComingSoon title="Client Payments" /></PrivateRoot>,
      },
      {
        path: "clients/ledger",
        element: <PrivateRoot><ComingSoon title="Client Ledger" /></PrivateRoot>,
      },

      // ================= 10. INVENTORY & STOCK (New) =================
      {
        path: "inventory",
        element: <PrivateRoot><ComingSoon title="Stock Overview" /></PrivateRoot>,
      },
      {
        path: "inventory/transfers",
        element: <PrivateRoot><ComingSoon title="Stock Transfers" /></PrivateRoot>,
      },
      {
        path: "inventory/warehouses",
        element: <PrivateRoot><ComingSoon title="Warehouses" /></PrivateRoot>,
      },

      // ================= 11. REPORT =================
      {
        path: "report/employee-directory",
        element: <PrivateRoot><Employeedirectory /></PrivateRoot>,
      },
      {
        path: "report/attendance",
        element: <PrivateRoot><Attendancereport /></PrivateRoot>,
      },
      {
        path: "report/payroll",
        element: <PrivateRoot><Payrollsummary /></PrivateRoot>,
      },

      // ================= 12. SETTINGS =================
      {
        path: "settings/departments",
        element: <PrivateRoot><Departments /></PrivateRoot>,
      },
      {
        path: "settings/designations",
        element: <PrivateRoot><Designations /></PrivateRoot>,
      },
      {
        path: "settings/leave-types",
        element: <PrivateRoot><LeaveTypes /></PrivateRoot>,
      },
      {
        path: "settings/salary-components",
        element: <PrivateRoot><SalaryComponents /></PrivateRoot>,
      },
      {
        path: "setting/permission",
        element: <PrivateRoot><UserPermission /></PrivateRoot>,
      },
    ],
  },
]);