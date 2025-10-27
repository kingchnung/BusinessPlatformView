import { lazy, Suspense } from "react";

// Suspense 로딩 컴포넌트
const Loading = <div>Loading...</div>;

// hr 기능에 필요한 페이지 컴포넌트들 import
const OrgChart = lazy(() => import("../employee/pages/OrgChartPage"));
const EmployeeCardList = lazy(() => import("../employee/pages/EmployeeCardListPage"));
const EmployeeDetail = lazy(() => import("../employee/pages/EmployeeDetailPage"));
const EmployeeCardAdd = lazy(() => import("../employee/pages/EmployeeCardAddPage"));
const EmployeMyEdit = lazy(() => import("../employee/pages/EmployeeMyEditPage"));
const EmployeMySelect = lazy(() => import("../employee/pages/EmployeeSelectPage"));
const EmployeEditor = lazy(() => import("../employee/pages/EmployeeEditFormPage"));
const DepartmentOverview = lazy(() => import("../department/pages/DepartmentOverviewPage"));
const Dashboard = lazy(()=>import("../department/pages/DepartmentDashboardPage"));
const DepartmentDetail = lazy(()=>import("../department/pages/DepartmentDetailPage"));
const DepartmentAssign = lazy(()=>import("../department/pages/DepartmentAssignPage"));
const DepartmentPromotion = lazy(()=>import("../department/pages/DepartmentPromosionPage"));
const AccountPwEdit = lazy(()=>import("../employee/pages/EmployeePWEditPage"));
const EmployeeAdminView = lazy(()=>import("../employee/pages/EmployeeAdminPage"));
const DummyPage = lazy(()=> import("../hrcommon/DummyPage"));

// hr 기능과 관련된 라우트 배열 정의

const hrRoutes = [
  {
    index:true,  // '/hr' 경로에 해당
    element: <Suspense fallback={Loading}><OrgChart /></Suspense>,
  },
  {
    // '/hr/employee/cards' 경로에 해당
    path: "employee/cards",
    element: <Suspense fallback={Loading}><EmployeeCardList /></Suspense>,
  },
  {
    path: "employee/detail/:empId",
    element: <Suspense fallback={Loading}><EmployeeDetail /></Suspense>,
  },
  {
    path: "employee/cards/add",
    element: <Suspense fallback={Loading}><EmployeeCardAdd /></Suspense>,
  },
  {
    path: "employee/cards/edit",
    element: <Suspense fallback={Loading}><EmployeMyEdit /></Suspense>,
  },
  {
    path: "employee/cards/edit/select",
    element: <Suspense fallback={Loading}><EmployeMySelect /></Suspense>,
  },
  {
    path: "employee/cards/edit/:empId",
    element: <Suspense fallback={Loading}><EmployeEditor /></Suspense>,
  },
  {
    path: "department/overview",
    element: <Suspense fallback={Loading}><DepartmentOverview /></Suspense>,
  },
  {
    path : "department",
    element:<Suspense fallback={Loading}><Dashboard /></Suspense>,
  },
  {
    path : "department/:deptId",
    element : <Suspense fallback={Loading}><DepartmentDetail /></Suspense>,
  },
  {
    path : "department/assign",
    element : <Suspense fallback={Loading}><DepartmentAssign /></Suspense>
  },
  {
    path : "department/promotion",
    element : <Suspense fallback={Loading}><DepartmentPromotion /></Suspense>
  },
  {
    path : "account/pwedit",
    element : <Suspense fallback={Loading}><AccountPwEdit /></Suspense>
  },
  {
    path: "employee/adminview",
    element : <Suspense fallback={Loading}><EmployeeAdminView/></Suspense>
  },
  {
  path: "attendance",
  element: <Suspense fallback={Loading}><DummyPage messageText="근태관리 2차 개발 준비중입니다." /></Suspense>,
},
{
  path: "leave",
  element: <Suspense fallback={Loading}><DummyPage messageText="휴가관리 2차 개발 준비중입니다." /></Suspense>,
},
{
  path: "salary",
  element: <Suspense fallback={Loading}><DummyPage messageText="급여관리 2차 개발 준비중입니다." /></Suspense>,
},

];

export default hrRoutes;