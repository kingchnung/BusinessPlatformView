import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

<<<<<<< HEAD
=======
// --- 레이아웃 컴포넌트 Import ---
import RootLayout from "./RootLayout"; // ✅ 1번에서 만든 최상위 레이아웃
import ApprovalRoutes from "../groupware/approval/router/ApprovalRoutes";
import ApprovalRouter from "../groupware/approval/router/ApprovalRouter";
// 참고: HR도 동일한 방식으로 분리할 수 있습니다. (HrLayout, hrRoutes)

>>>>>>> 31bd0f3cdcdc75a0b06222e4254a08a17f7d5fbc
const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));
<<<<<<< HEAD

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

const ClientList = lazy(()=> import("../sales/pages/ClientListPage"));

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
  },
  // {
  //   path: "/hr/employee/cards/delete",
  //   element: (
  //     <Suspense fallback={Loading}><Main><EmployeeCardDelete /></Main></Suspense>
  //   ),
  // },

    //  🧸🐟 sales 페이지 🕊️🐤 
  {
      path: "/sales/client/clientList",
      element: <Suspense fallback={Loading}><ClientList /></Suspense>
  }


=======

const root = createBrowserRouter([
  {
    // 최상위 경로: 모든 자식 경로는 RootLayout의 Outlet에 렌더링됩니다.
    // 따라서 모든 페이지에 접속 시 RootLayout의 useEffect가 실행됩니다.
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true, // path: '/' 일 때 기본 페이지
        element: <Suspense fallback={Loading}><Main /></Suspense>,
      },
      {
        path: "main",
        element: <Suspense fallback={Loading}><Main /></Suspense>,
      },
      // --- 전자결재 모듈 ---
      {
        path: "approvals",
        element: <ApprovalRouter />,
        children: ApprovalRoutes,
      },
    ],
  },
  {
    // 레이아웃이 필요 없는 독립 페이지
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
  },
>>>>>>> 31bd0f3cdcdc75a0b06222e4254a08a17f7d5fbc
]);

export default root;