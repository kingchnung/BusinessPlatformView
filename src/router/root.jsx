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
import BoardRoutes from "../groupware/board/router/BoardRoutes";
import salesRoutes from "../sales/router/SalesRoutes";
import SalesRouter from "../sales/router/SalesRouter";
// 참고: HR도 동일한 방식으로 분리할 수 있습니다. (HrLayout, hrRoutes)





const Loading = <div>Loading...</div>;
const Main = lazy(() => import("../pages/MainPage"));
const Login = lazy(() => import("../pages/LoginPage"));
const Intro = lazy(() => import("../pages/IntroPage"));

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
      {
        path: "boards",
        element: <BoardRouter />,
        children: BoardRoutes,
      },
      {
        path: "/sales",
        element: <SalesRouter />,
        children: salesRoutes,
      },
      {
        path: "hr",
        element: <HrRouter />,
        children: hrRoutes,
      },
      {
        path: "admin",
        element: <AdminRouter />,
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