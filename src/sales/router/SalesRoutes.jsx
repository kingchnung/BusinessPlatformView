import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const ClientListPage = lazy(() => import("../pages/ClientListPage"));
const SalesTargetPage = lazy(()=> import("../pages/SalesTargetPage"));
const OrderListPage = lazy(() => import("../pages/OrderListPage"));
const SalesListPage = lazy(() =>import("../pages/SalesListPage"));
const CollectionListPage = lazy(() => import("../pages/CollectionListPage"));

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
  {
    path: "sales/list",
    element: <Suspense fallback={Loading}><SalesListPage /></Suspense>,
  },
  {
    path: "collection/list",
    element: <Suspense fallback={Loading}><CollectionListPage /></Suspense>,
  },

];

export default salesRoutes;