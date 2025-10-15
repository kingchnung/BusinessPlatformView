import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

// 전자결재 모듈에서만 사용할 페이지 컴포넌트들을 여기서 import 합니다.
const ApprovalList = lazy(() => import("../pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../pages/ApprovalDetailPage"));
const Resubmit = lazy(() => import("../pages/ResubmitPage"));
const EditDraft = lazy(() => import("../pages/EditDraftPage"));

const approvalRoutes = [
  {
    index: true, // 부모 경로('/approvals')와 동일할 때 기본으로 보여줄 페이지
    element: <Suspense fallback={Loading}><ApprovalList /></Suspense>,
  },
  {
    path: "draft", // '/approvals/draft'
    element: <Suspense fallback={Loading}><ApprovalDraft /></Suspense>,
  },
  {
    path: ":id", // '/approvals/123'
    element: <Suspense fallback={Loading}><ApprovalDetail /></Suspense>,
  },
  {
    path: ":docId/draft", // '/approvals/456/draft'
    element: <Suspense fallback={Loading}><EditDraft /></Suspense>,
  },
  {
    path: ":docId/resubmit", // '/approvals/789/resubmit'
    element: <Suspense fallback={Loading}><Resubmit /></Suspense>,
  },
];

export default approvalRoutes;