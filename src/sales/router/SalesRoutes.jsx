import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const ClientListPage = lazy(() => import("../pages/ClientListPage"));
const SalesTargetPage = lazy(()=> import("../pages/SalesTargetPage"));
const OrderListPage = lazy(() => import("../pages/OrderListPage"));

const salesRoutes = [
    {
    index: true,
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
  {
    path: "client/list", 
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
  {
    path: "revenue/goals", 
    element: <Suspense fallback={Loading}><SalesTargetPage /></Suspense>,
  },
  {
    path: "order/list",
    element: <Suspense fallback={Loading}><OrderListPage /></Suspense>,
  },
];

export default salesRoutes;