import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const ApprovalList = lazy(() => import("../pages/ApprovalListPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <Suspense fallback={Loading}><Main /></Suspense>,
  },
  {
    path: "/approvals",
    element: <Suspense fallback={Loading}><ApprovalList /></Suspense>,
  },
]);

export default root;