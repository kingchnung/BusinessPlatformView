import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

// MainPage는 모든 전자결재 페이지의 공통 레이아웃(Header, Sidebar 등)을 제공합니다.
const Loading = <div>Loading...</div>;

export default function ApprovalRouter() {
  return (
    <MainLayout>
      <Suspense fallback={Loading}>
        {/* 이 Outlet에 아래 2단계에서 정의할 자식 페이지들이 렌더링됩니다. */}
        <Outlet />
      </Suspense >
    </MainLayout>
  );
}