import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

// ✅ 페이지 import (lazy)
const BoardList = lazy(() => import("../pages/BoardListPage"));
const BoardDetail = lazy(() => import("../pages/BoardDetailPage"));
const BoardForm = lazy(() => import("../pages/BoardFormPage"));
const BoardEdit = lazy(() => import("../pages/BoardEditPage"));

// ✅ 하위 라우트 정의
const boardRoutes = [

  {
    index: true,
    element: <Suspense fallback={Loading}><BoardList /></Suspense>,
  },
  {
    path: "write", // /board/write
    element: (
      <Suspense fallback={Loading}>
        <BoardForm />
      </Suspense>
    ),
  },
  {
    path: ":id", // /board/1
    element: (
      <Suspense fallback={Loading}>
        <BoardDetail />
      </Suspense>
    ),
  },
  {
    path: ":id/edit", // /board/1/edit
    element: (
      <Suspense fallback={Loading}>
        <BoardEdit />
      </Suspense>
    ),
  },
  {
    path: "type/:boardType",
    element:
      <Suspense fallback={Loading}>
        <BoardList />
      </Suspense>
  },

];

export default boardRoutes;