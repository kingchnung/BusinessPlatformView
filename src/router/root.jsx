import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- 레이아웃 컴포넌트 Import ---
import RootLayout from "./RootLayout"; // ✅ 1번에서 만든 최상위 레이아웃
import ProtectedRoute from "./ProtectedRoute";
import AdminRouter from "../admin/router/AdminRouter";
import adminRoutes from "../admin/router/AdminRoutes";
import ApprovalRoutes from "../groupware/router/GroupwareRoutes";
import ApprovalRouter from "../groupware/router/GroupwareRouter";
import hrRoutes from "../hr/router/HrRoutes";
import HrRouter from "../hr/router/HrRouter";
import WorkRouter from "../work/router/workRouter";
import workRoutes from "../work/router/workRoutes";
import SalesRouter from "../sales/router/SalesRouter";
import SalesRoutes from "../sales/router/SalesRoutes";

import BoardRouter from "../groupware/board/router/BoardRouter";
import boardRoutes from "../groupware/board/router/BoardRoutes";
// 참고: HR도 동일한 방식으로 분리할 수 있습니다. (HrLayout, hrRoutes)


const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));
const Intro = lazy(()=>import("../pages/IntroPage"));
const FindPassword = lazy(() => import("../pages/FindPassword"));

const Project = lazy(() => import ("../pages/ProjectPage"));

const root = createBrowserRouter([

  {
    // 최상위 경로: 모든 자식 경로는 RootLayout의 Outlet에 렌더링됩니다.
    // 따라서 모든 페이지에 접속 시 RootLayout의 useEffect가 실행됩니다.
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
      {
        path: "/boards",
        element: <BoardRouter />,
        children: boardRoutes,
      },
      //----인사파트 모듈---
      {
        path:"hr",
        element:<HrRouter />,
        children: hrRoutes,
      },
      {
        path :"admin",
        element : <AdminRouter />,
        children: adminRoutes,     
      },
      {
        path :"/work",
        element : <WorkRouter />,
        children: workRoutes,     
      },

      {
        path :"sales",
        element : <SalesRouter />,
        children: SalesRoutes,     
      },
    ],
  },
  {
    // 레이아웃이 필요 없는 독립 페이지
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
  },
  {
    path: "/find-password",           // ✅ 추가
    element: <Suspense fallback={Loading}><FindPassword /></Suspense>,
  },
]);

export default root;