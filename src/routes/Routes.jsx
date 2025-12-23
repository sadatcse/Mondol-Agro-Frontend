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
    ],
  },
]);
