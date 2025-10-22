import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- 레이아웃 컴포넌트 Import ---
import RootLayout from "./RootLayout"; // ✅ 1번에서 만든 최상위 레이아웃
import ProtectedRoute from "./ProtectedRoute";
import AdminRouter from "../admin/router/AdminRouter";
import adminRoutes from "../admin/router/AdminRoutes";
import ApprovalRoutes from "../groupware/approval/router/ApprovalRoutes";
import ApprovalRouter from "../groupware/approval/router/ApprovalRouter";
import hrRoutes from "../hr/router/HrRoutes";
import HrRouter from "../hr/router/HrRouter";

import BoardRouter from "../groupware/board/router/BoardRouter";
import boardRoutes from "../groupware/board/router/BoardRoutes";

import salesRoutes from "../sales/router/SalesRoutes";
import SalesRouter from "../sales/router/SalesRouter";
// 참고: HR도 동일한 방식으로 분리할 수 있습니다. (HrLayout, hrRoutes)


import MainLayout from "../layouts/MainLayout";




const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));
const Intro = lazy(() => import("../pages/IntroPage"));

const ApprovalList = lazy(() => import("../groupware/approval/pages/ApprovalListPage"));
const ApprovalDraft = lazy(() => import("../groupware/approval/pages/ApprovalDraftPage"));
const ApprovalDetail = lazy(() => import("../groupware/approval/pages/ApprovalDetailPage"));
const Resubmit = lazy(() => import("../groupware/approval/pages/ResubmitPage"));
const EditDraft = lazy(() => import("../groupware/approval/pages/EditDraftPage"));

const OrgChart = lazy(() => import("../hr/employee/pages/OrgChartPage"));
const EmployeeCardList = lazy(() => import("../hr/employee/pages/EmployeeCardListPage"));
const EmployeeDetail = lazy(() => import("../hr/employee/pages/EmployeeDetailPage"));
const EmployeeCardAdd = lazy(() => import("../hr/employee/pages/EmployeeCardAddPage"));
const EmployeMyEdit = lazy(() => import("../hr/employee/pages/EmployeeMyEditPage"));
const EmployeMySelect = lazy(() => import("../hr/employee/pages/EmployeeSelectPage"));
const EmployeEditor = lazy(() => import("../hr/employee/pages/EmployeeEditFormPage"));

const root = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true, // path: '/' 일 때 기본 페이지
        element: <Suspense fallback={Loading}>

          <Intro />

        </Suspense>,
      },
      {
        path: "main",
        element: <Suspense fallback={Loading}>
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        </Suspense>,
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

{
    path: "/sales",
    element: <SalesRouter />, 
    children: salesRoutes,
  },

]);

export default root;