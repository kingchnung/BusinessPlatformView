import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const ClientListPage = lazy(() => import("../pages/client/ClientListPage"));
const ClientDetailPage = lazy(() => import("../pages/client/ClientDetailPage"));

const salesRoutes = [
    {
    index: true,
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
  {
    path: "client/list", // path: /sales/client/list
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
  {
    path: "client/:clientNo", // path: /sales/client/1
    element: <Suspense fallback={Loading}><ClientDetailPage /></Suspense>,
  },
];

export default salesRoutes;