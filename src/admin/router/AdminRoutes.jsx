import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

// 앞으로 만들 부서 관리 페이지
const DepartmentAdminPage = lazy(() => import("../pages/DepartmentAdminPage"));

const adminRoutes = [
  {
    // '/admin' 경로의 기본 페이지를 부서 관리로 설정
    index: true,
    element: <Suspense fallback={Loading}><DepartmentAdminPage /></Suspense>,
  },
  {
    // 명시적인 경로: /admin/departments
    path: "departments",
    element: <Suspense fallback={Loading}><DepartmentAdminPage /></Suspense>,
  },
  {
    path : "positions",
    element:<Suspense fallback={Loading}><baseInfoPositionPage /></Suspense>
  }
];

export default adminRoutes;