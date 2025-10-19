import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const ClientListPage = lazy(() => import("../pages/ClientListPage"));

const salesRoutes = [
    {
    index: true,
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
  {
    path: "client/list", // path: /sales/client/list
    element: <Suspense fallback={Loading}><ClientListPage /></Suspense>,
  },
];

export default salesRoutes;