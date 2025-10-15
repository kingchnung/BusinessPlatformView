import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import hrRoutes from "../hr/router/hrRoutes";
// import approvalRoutes from "../approval";


const Loading = <div>Loading...</div>;

const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));

const root = createBrowserRouter([

  {
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
  },

  {
    path: "/",
    element: <Suspense fallback={Loading}><MainLayout /></Suspense>,
    children: [
      {
        index: true,
        element:<Suspense fallback={Loading}><Main /></Suspense>
      },
      {
        path:"hr",
        children: hrRoutes,
      },
      // {
      //   path:"approval",
      //   children:approvalRoutes,
      // },
    ]
  },




]);

export default root;