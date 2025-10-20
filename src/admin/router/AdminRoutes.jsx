import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

// 앞으로 만들 부서 관리 페이지
const DepartmentAdminPage = lazy(() => import("../pages/DepartmentAdminPage"));
const GradeAdminPage = lazy(() => import("../pages/GradeAdminPage"));
const PositionAdminPage = lazy(() => import("../pages/PositionAdminPage"));
const PermissionAdminPage = lazy(()=> import("../pages/PermissionAdminPage"));
const RoleAdminPage = lazy(()=>import("../pages/RoleAdminPage"));
const UserAccountAdmin = lazy(()=>import("../pages/UserAccountAdminPage"));
const ApprovalAdmin = lazy(() => import("../pages/ApprovalAdminPage"));
const ApprovalPolicy = lazy(() => import("../pages/ApprovalPolicyPage"));


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
    // ✅ 직급 관리
    path: "baseinfo/grades",
    element: <Suspense fallback={Loading}><GradeAdminPage /></Suspense>,
  },
  {
    // ✅ 직위 관리
    path: "baseinfo/positions",
    element: <Suspense fallback={Loading}><PositionAdminPage /></Suspense>,
  },
  {
    path: "system/permissions",
    element: <Suspense fallback={Loading}><PermissionAdminPage /></Suspense>,
  },
  {
    path: "system/roles",
    element: <Suspense fallback={Loading}><RoleAdminPage /></Suspense>,
  },
  {
    path : "system/accounts",
    element : <Suspense fallback={Loading}><UserAccountAdmin /></Suspense>
  },
  {
    path : "approval/list",
    element : <Suspense fallback={Loading}><ApprovalAdmin /></Suspense>
  },
  {
    path : "approval/policy",
    element : <Suspense fallback={Loading}><ApprovalPolicy /></Suspense>
  },

];

export default adminRoutes;