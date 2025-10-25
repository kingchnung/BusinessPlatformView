import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const ApprovalList = lazy(() => import("../approval/pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../approval/pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../approval/pages/ApprovalDetailPage"));
const Resubmit = lazy(() => import("../approval/pages/ResubmitPage"));
const EditDraft = lazy(() => import("../approval/pages/EditDraftPage"));

const approvalRoutes = [
  {
    index: true, 
    element: <Suspense fallback={Loading}><ApprovalList /></Suspense>,
  },
  {
    path: "draft", 
    element: <Suspense fallback={Loading}><ApprovalDraft /></Suspense>,
  },
  {
    path: ":id", 
    element: <Suspense fallback={Loading}><ApprovalDetail /></Suspense>,
  },
  {
    path: ":docId/edit", 
    element: <Suspense fallback={Loading}><EditDraft /></Suspense>,
  },
  {
    path: ":docId/resubmit", 
    element: <Suspense fallback={Loading}><Resubmit /></Suspense>,
  },
];

export default approvalRoutes;