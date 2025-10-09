import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ApprovalDraftPage from "../pages/ApprovalDraftPage";
import MockLoginPage from "../pages/MockLoginPage";

const Loading = <div>Loading...</div>;

const Main = lazy(() => import("../pages/MainPage"));
const MockLogin = lazy(() => import("../pages/MockLoginPage"))
const ApprovalList = lazy(() => import("../pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../pages/ApprovalDetailPage"));

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
    path: "/mockLogin",
    element: <Suspense fallback={Loading}><MockLogin /></Suspense>,
  },
  {
    path: "/approval/:id",
    element: <Suspense fallback={Loading}><ApprovalDetail /></Suspense>,
  },
]);

export default root;