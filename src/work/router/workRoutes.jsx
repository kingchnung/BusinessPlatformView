import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

// ----------------------------
// 📁 프로젝트 관리 (Project)
// ----------------------------
const ProjectOverview = lazy(() => import("../project/pages/ProjectOverviewPage")); // 현황
const ProjectDetail = lazy(() => import("../project/pages/ProjectDetailPage"));     // 조회
const ProjectEdit = lazy(() => import("../project/pages/ProjectEditPage"));         // 수정
const ProjectList = lazy(() => import("../project/pages/ProjectListPage"));     // 생성

// ----------------------------
// 📁 업무 관리 (Task)
// ----------------------------
// const MyTaskPage = lazy(() => import("../task/pages/MyTaskPage"));                  // 내 업무 관리
// const TaskAssignPage = lazy(() => import("../task/pages/TaskAssignPage"));          // 담당자 지정 (관리자)

// ----------------------------
// 📁 멤버, 예산 (추후 확장)
// ----------------------------
// const MemberListPage = lazy(() => import("../member/pages/MemberListPage"));
// const BudgetItemPage = lazy(() => import("../budgetItem/pages/BudgetItemPage"));

// ----------------------------
// 라우트 배열 정의
// ----------------------------
const workRoutes = [
  // ----------------------------
  // 프로젝트 관리
  // ----------------------------
  {
    index: true, // /work 기본 경로
    element: <Suspense fallback={Loading}><ProjectOverview /></Suspense>,
  },
  {
    path: "work",
    element: <Suspense fallback={Loading}><ProjectOverview /></Suspense>,
  },
  {
    path: "project/detail/:projectId",
    element: <Suspense fallback={Loading}><ProjectDetail /></Suspense>,
  },
  {
    path: "project/edit",
    element: <Suspense fallback={Loading}><ProjectEdit /></Suspense>,
  },
  {
    path: "project/create",
    element: <Suspense fallback={Loading}><ProjectList /></Suspense>,
  },

//   // ----------------------------
//   // 업무(Task) 관리
//   // ----------------------------
//   {
//     path: "task/my",
//     element: <Suspense fallback={Loading}><MyTaskPage /></Suspense>,
//   },
//   {
//     path: "task/assign",
//     element: <Suspense fallback={Loading}><TaskAssignPage /></Suspense>,
//   },

  // ----------------------------
  // (선택) 향후 확장용
  // ----------------------------
  // {
  //   path: "member/list",
  //   element: <Suspense fallback={Loading}><MemberListPage /></Suspense>,
  // },
  // {
  //   path: "budget",
  //   element: <Suspense fallback={Loading}><BudgetItemPage /></Suspense>,
  // },
];

export default workRoutes;
