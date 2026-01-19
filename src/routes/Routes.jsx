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
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/capital",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/loans",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/profit-loss",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/balance-sheet",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "finance/cash-flow",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
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
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "company/expenses",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "company/purchases",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
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
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "hr/performance",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "hr/salary-transfer",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },

      // ================= PROJECTS =================
      {
        path: "project",
        element: <PrivateRoot><Project /></PrivateRoot>,
      },
      {
        path: "projects/payments",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "projects/ledger",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },

      // ================= VENDORS =================
      {
        path: "vendor",
        element: <PrivateRoot><Vendor /></PrivateRoot>,
      },
      {
        path: "vendors/purchases",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "vendors/payments",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "vendors/ledger",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },

      // ================= CLIENTS =================
      {
        path: "clients",
        element: <PrivateRoot><Client /></PrivateRoot>,
      },
      {
        path: "clients/payments",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "clients/ledger",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },

      // ================= INVENTORY & STOCK (New Placeholders) =================
      {
        path: "inventory",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "inventory/transfers",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
      },
      {
        path: "inventory/warehouses",
        element: <PrivateRoot><UserPermission /></PrivateRoot>, // Placeholder
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



      
    ],
  },
]);