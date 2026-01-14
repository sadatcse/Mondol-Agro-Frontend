import { createBrowserRouter, Navigate } from "react-router-dom";

import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import Users from "../pages/OtherPage/users";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";
import Home from "../pages/Dashboard/Home";

import CashIn from "../pages/Main/CashIn";
import Vendor from "../pages/Main/Vendor";
import Project from "../pages/Main/Project";
import Employee from "../pages/Main/Employee";
import Company from "../pages/Main/Company";
import Cashout from "../pages/Main/Cashout";
import Client from "../pages/Main/Client";


import Departments from "../pages/Employee/Departments";
import Designations from "../pages/Employee/Designations";
import LeaveTypes from "../pages/Employee/Leave_Types";
import SalaryComponents from "../pages/Employee/Salary_Components";

import Attendance from "../pages/Employee/Attendance";
import Leaves from "../pages/Employee/Leaves";
import Payroll from "../pages/Employee/Payroll";
import Payrollsummary from "../pages/Report/Payrollsummary";
import Attendancereport from "../pages/Report/Attendancereport";
import Employeedirectory from "../pages/Report/Employeedirectory";
import Attendence from "../pages/OfficeUser/Attendence";
import Directory from "../pages/OfficeUser/Directory";
import Papers from "../pages/OfficeUser/Papers";
import Profile from "../pages/OfficeUser/Profile";
import TimeSheet from "../pages/OfficeUser/TimeSheet";

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
      {
        path: "home",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "users",
        element: <PrivateRoot><Users /></PrivateRoot>,
      },
      {
        path: "cashout",
        element: <PrivateRoot><Cashout /></PrivateRoot>,
      },
      {
        path: "company",
        element: <PrivateRoot><Company /></PrivateRoot>,
      },
      {
        path: "employee",
        element: <PrivateRoot><Employee /></PrivateRoot>,
      },
      {
        path: "project",
        element: <PrivateRoot><Project /></PrivateRoot>,
      },
      {
        path: "vendor",
        element: <PrivateRoot><Vendor /></PrivateRoot>,
      },
      {
        path: "cashIn",
        element: <PrivateRoot><CashIn /></PrivateRoot>,
      },
      {
        path: "client",
        element: <PrivateRoot><Client /></PrivateRoot>,
      },

      /* ===== Settings Routes ===== */
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

      /* ===== Employee Routes ===== */
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
        {
        path: "office/attendence",
        element: <PrivateRoot><Attendence /></PrivateRoot>,
      },
        {
        path: "office/directory",
        element: <PrivateRoot><Directory /></PrivateRoot>,
      },
        {
        path: "office/papers",
        element: <PrivateRoot><Papers /></PrivateRoot>,
      },
        {
        path: "office/profile",
        element: <PrivateRoot><Profile /></PrivateRoot>,
      },
        {
        path: "office/timesheet",
        element: <PrivateRoot><TimeSheet /></PrivateRoot>,
      },



    ],
  },
]);
