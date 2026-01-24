import { createBrowserRouter, Navigate } from "react-router-dom";

import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";

// Dashboard & Main
import Home from "../pages/Dashboard/Home";
import CashIn from "../pages/Main/CashIn";
import Cashout from "../pages/Main/Cashout";
import Company from "../pages/Main/Company";
import Employee from "../pages/Main/Employee";
import Project from "../pages/Main/Project";
import Vendor from "../pages/Main/Vendor";
import Client from "../pages/Main/Client";
import Users from "../pages/OtherPage/users";

// Employee Pages
import Departments from "../pages/Employee/Departments";
import Designations from "../pages/Employee/Designations";
import LeaveTypes from "../pages/Employee/Leave_Types";
import SalaryComponents from "../pages/Employee/Salary_Components";
import Attendance from "../pages/Employee/Attendance";
import Leaves from "../pages/Employee/Leaves";
import Payroll from "../pages/Employee/Payroll";

// Report Pages
import Payrollsummary from "../pages/Report/Payrollsummary";
import Attendancereport from "../pages/Report/Attendancereport";
import Employeedirectory from "../pages/Report/Employeedirectory";

// Office User Pages
import Attendence from "../pages/OfficeUser/Attendence";
import Directory from "../pages/OfficeUser/Directory";
import Papers from "../pages/OfficeUser/Papers";
import Profile from "../pages/OfficeUser/Profile";
import TimeSheet from "../pages/OfficeUser/TimeSheet";

// Settings
import UserPermission from "../pages/Setting/UserPermission";
import PaymentType from "../pages/Setting/PaymentType";
import ExpenseCategory from "../pages/Setting/ExpenseCategory";
import ActivityLog from "../pages/Setting/ActivityLog";
import Warehouses from "../pages/Inventory/Warehouses";
import Transfers from "../pages/Inventory/Transfers";
import Inventory from "../pages/Inventory/Inventory";
import Ledger from "../pages/Clients/Ledger";
import Payments from "../pages/Clients/Payments";


import VendorList from "../pages/Vendor/VendorList";
import VendorPurchases from "../pages/Vendor/VendorPurchases";
import VendorPayments from "../pages/Vendor/VendorPayments";
import VendorLedger from "../pages/Vendor/VendorLedger";
import ProjectPayments from "../pages/Projects/ProjectPayments";
import ProjectLedger from "../pages/Projects/ProjectLedger";
import Hrletters from "../pages/Employee/Hrletters";

import Hrperformance from "../pages/Employee/Hrperformance";
import Hrsalarytransfer from "../pages/Employee/Hrsalarytransfer";
import Companypurchases from "../pages/Company/Companypurchases";
import Companybalancesheet from "../pages/Company/Companybalancesheet";
import Companyexpenses from "../pages/Company/Companyexpenses";
import Chartofaccounts from "../pages/Finance/Chartofaccounts";
import Capital from "../pages/Finance/Capital";
import Loans from "../pages/Finance/Loans";
import Profitloss from "../pages/Finance/Profitloss";
import Balancesheet from "../pages/Finance/Balancesheet";
import Cashflow from "../pages/Finance/Cashflow";



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
      {
        path: "",
        element: (
          <PrivateRoot>
            <Navigate to="home" replace />
          </PrivateRoot>
        ),
      },

      // ================= DASHBOARD =================
      {
        path: "home",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // ================= OFFICE MANAGEMENT =================
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

      // ================= FINANCE & ACCOUNTING (New Placeholders) =================
      {
        path: "finance/chart-of-accounts",
        element: <PrivateRoot><Chartofaccounts /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/capital",
        element: <PrivateRoot><Capital /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/loans",
        element: <PrivateRoot><Loans /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/profit-loss",
        element: <PrivateRoot><Profitloss /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/balance-sheet",
        element: <PrivateRoot><Balancesheet /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/cash-flow",
        element: <PrivateRoot><Cashflow /></PrivateRoot>, // Placeholder
      },

      // ================= CASH =================
      {
        path: "cashIn",
        element: <PrivateRoot><CashIn /></PrivateRoot>,
      },
      {
        path: "cashout",
        element: <PrivateRoot><Cashout /></PrivateRoot>,
      },

      // ================= COMPANY MANAGEMENT =================
      {
        path: "company",
        element: <PrivateRoot><Company /></PrivateRoot>,
      },
      {
        path: "company/balance-sheet",
        element: <PrivateRoot><Companybalancesheet /></PrivateRoot>, // Placeholder
      },
      {
        path: "company/expenses",
        element: <PrivateRoot><Companyexpenses /></PrivateRoot>, // Placeholder
      },
      {
        path: "company/purchases",
        element: <PrivateRoot><Companypurchases /></PrivateRoot>, // Placeholder
      },

      // ================= EMPLOYEE (HR/Admin) =================
      {
        path: "employee",
        element: <PrivateRoot><Employee /></PrivateRoot>,
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
        element: <PrivateRoot><Users /></PrivateRoot>,
      },
      {
        path: "hr/letters",
        element: <PrivateRoot><Hrletters /></PrivateRoot>, 
      },
      {
        path: "hr/performance",
        element: <PrivateRoot><Hrperformance /></PrivateRoot>, 
      },
      {
        path: "hr/salary-transfer",
        element: <PrivateRoot><Hrsalarytransfer /></PrivateRoot>,
      },

      // ================= PROJECTS =================
      {
        path: "project",
        element: <PrivateRoot><Project /></PrivateRoot>,
      },
      {
        path: "projects/payments",
        element: <PrivateRoot><ProjectPayments /></PrivateRoot>, 
      },
      {
        path: "projects/ledger",
        element: <PrivateRoot><ProjectLedger /></PrivateRoot>, 
      },

      // ================= VENDORS =================
      {
        path: "vendor",
        element: <PrivateRoot><VendorList /></PrivateRoot>,
      },
      {
        path: "vendors/purchases",
        element: <PrivateRoot><VendorPurchases /></PrivateRoot>, 
      },
      {
        path: "vendors/payments",
        element: <PrivateRoot><VendorPayments /></PrivateRoot>, 
      },
      {
        path: "vendors/ledger",
        element: <PrivateRoot><VendorLedger /></PrivateRoot>,
      },

      // ================= CLIENTS =================
      {
        path: "clients",
        element: <PrivateRoot><Client /></PrivateRoot>,
      },
      {
        path: "clients/payments",
        element: <PrivateRoot><Payments /></PrivateRoot>, 
      },
      {
        path: "clients/ledger",
        element: <PrivateRoot><Ledger /></PrivateRoot>, 
      },

      // ================= INVENTORY & STOCK (New Placeholders) =================
      {
        path: "inventory",
        element: <PrivateRoot><Inventory /></PrivateRoot>, 
      },
      {
        path: "inventory/transfers",
        element: <PrivateRoot><Transfers /></PrivateRoot>, 
      },
      {
        path: "inventory/warehouses",
        element: <PrivateRoot><Warehouses/></PrivateRoot>, 
      },

      // ================= REPORTS =================
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

      // ================= SETTINGS =================
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
       {
        path: "setting/paymenttype",
        element: <PrivateRoot><PaymentType /></PrivateRoot>,
      },
          {
        path: "setting/expensecategory",
        element: <PrivateRoot><ExpenseCategory /></PrivateRoot>,
      },
      {
        path: "setting/activitylog",
        element: <PrivateRoot><ActivityLog /></PrivateRoot>,
      },

    ],
  },
]);