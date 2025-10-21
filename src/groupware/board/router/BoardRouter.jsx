import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const Loading = <div>Loading...</div>;

export default function BoardRouter() {
  return (
    <Suspense fallback={Loading}>
      {/* 게시판 공통 레이아웃 영역 */}
      <Outlet />
    </Suspense>
  );
}