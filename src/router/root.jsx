import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading...</div>;

const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));

const ApprovalList = lazy(() => import("../approval/pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../approval/pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../approval/pages/ApprovalDetailPage"));
const Resubmit = lazy(() => import("../approval/pages/ResubmitPage"));
const EditDraft = lazy(() => import("../approval/pages/EditDraftPage"));

const OrgChart = lazy(() => import("../hr/employee/pages/OrgChartPage"));
const EmployeeCardList = lazy(() => import("../hr/employee/pages/EmployeeCardListPage"));
const EmployeeDetail = lazy(() => import("../hr/employee/pages/EmployeeDetailPage"));
const EmployeeCardAdd = lazy(()=>import("../hr/employee/pages/EmployeeCardAddPage"));
const EmployeMyEdit = lazy(()=>import("../hr/employee/pages/EmployeeMyEditPage"));
const EmployeMySelect = lazy(()=>import("../hr/employee/pages/EmployeeSelectPage"));
const EmployeEditor = lazy(()=>import("../hr/employee/pages/EmployeeEditFormPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <Suspense fallback={Loading}><Main /></Suspense>,
  },
  {
    path: "/main",
    element: <Suspense fallback={Loading}><Main /></Suspense>,
  },
  {
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
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
    path: "/approvals/:docId/draft",
    element: <Suspense fallback={Loading}><EditDraft /></Suspense>,
  },
  {
    path: "/approvals/:id",
    element: <Suspense fallback={Loading}><ApprovalDetail /></Suspense>,
  },
  {
    // ✅ 반려 문서 재상신 페이지
    path: "/approvals/:docId/resubmit",
    element: (
      <Suspense fallback={Loading}>
        <Resubmit />
      </Suspense>
    ),
  },

  {
    path: "/hr",
    element: (
    <Suspense fallback={Loading}><Main><OrgChart /></Main></Suspense>
    ),
  },

  {
    path: "/hr/employee/cards",
    element: (
      <Suspense fallback={Loading}><Main><EmployeeCardList /></Main></Suspense>
    ),
  },
  {
    path : "hr/employee/detail/:empId",
    element : (
      <Suspense fallback={Loading}>
        <Main>
          <EmployeeDetail />
        </Main>
      </Suspense>
    )
  },
  {
    path: "/hr/employee/cards/add",
    element: (
      <Suspense fallback={Loading}><Main><EmployeeCardAdd /></Main></Suspense>
    ),
  },
  {
    path : "hr/employee/cards/edit",
    element : (
      <Suspense fallback={Loading}>
        <Main>
          <EmployeMyEdit />
        </Main>
      </Suspense>
    )
  },
  {
    path : "hr/employee/cards/edit/select",
    element : (
      <Suspense fallback={Loading}>
        <Main>
          <EmployeMySelect />
        </Main>
      </Suspense>
    )
  },
  {
    path : "hr/employee/cards/edit/:empId",
    element : (
      <Suspense fallback={Loading}>
        <Main>
          <EmployeEditor />
        </Main>
      </Suspense>
    )
  }
  // {
  //   path: "/hr/employee/cards/delete",
  //   element: (
  //     <Suspense fallback={Loading}><Main><EmployeeCardDelete /></Main></Suspense>
  //   ),
  // },


]);

export default root;