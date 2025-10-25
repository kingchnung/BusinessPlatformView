import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const Loading = <div>Loading...</div>;

/**
 * ✅ WorkRouter
 * - 프로젝트/업무 관련 페이지의 공통 레이아웃 제공
 * - Header, Sidebar 등은 MainLayout에서 통합 관리
 */
export default function workRouter() {
  console.log("✅ WorkRouter 렌더링됨");
  return (
    <Suspense fallback={Loading}>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </Suspense>
  );
}
