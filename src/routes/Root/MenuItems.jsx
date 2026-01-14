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
  MdContactPage
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
      title: "Company",
      path: "/dashboard/company",
      icon: <MdBusiness className="text-lg" />,
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
      ],
    },

    // ================= PROJECT =================
    {
      title: "Project",
      path: "/dashboard/project",
      icon: <MdAssignment className="text-lg" />,
    },

    // ================= VENDOR =================
    {
      title: "Vendor",
      path: "/dashboard/vendor",
      icon: <MdLocalShipping className="text-lg" />,
    },

    // ================= CLIENT =================
    {
      title: "Client",
      path: "/dashboard/client",
      icon: <MdPeople className="text-lg" />,
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
      ],
    },
  ];
};

export default menuItems;