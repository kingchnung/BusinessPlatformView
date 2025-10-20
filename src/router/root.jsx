import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// --- 레이아웃 컴포넌트 Import ---
import RootLayout from "./RootLayout"; // ✅ 1번에서 만든 최상위 레이아웃
import AdminRouter from "../admin/router/AdminRouter";
import adminRoutes from "../admin/router/AdminRoutes";
import ApprovalRoutes from "../groupware/approval/router/ApprovalRoutes";
import ApprovalRouter from "../groupware/approval/router/ApprovalRouter";
import hrRoutes from "../hr/router/HrRoutes";
import HrRouter from "../hr/router/HrRouter";

// 참고: HR도 동일한 방식으로 분리할 수 있습니다. (HrLayout, hrRoutes)


import MainLayout from "../layouts/MainLayout";




const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));

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

    ],
  },
  {
    // 레이아웃이 필요 없는 독립 페이지
    path: "/login",
    element: <Suspense fallback={Loading}><Login /></Suspense>,
  },
  

]);

export default root;