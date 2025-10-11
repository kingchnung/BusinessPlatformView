import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";


const Loading = <div>Loading...</div>;

const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));
const ApprovalList = lazy(() => import("../approval/pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../approval/pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../approval/pages/ApprovalDetailPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <Suspense fallback={Loading}><Main /></Suspense>,
  },
  {
    path: "/approvals",
    element: <Suspense fallback={Loading}><ApprovalList /></Suspense>,
  },
  {
    path: "/approvals/draft",
    element: <Suspense fallback={Loading}><ApprovalDraft /></Suspense>,
  },
  {
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
  },
  {
    path: "/approval/:id",
    element: <Suspense fallback={Loading}><ApprovalDetail /></Suspense>,
  },
]);

export default root;