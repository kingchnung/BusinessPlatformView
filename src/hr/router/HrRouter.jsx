import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

// MainPage는 모든 전자결재 페이지의 공통 레이아웃(Header, Sidebar 등)을 제공합니다.
const Loading = <div>Loading...</div>;

export default function hrRouter() {
    console.log("✅ HrRouter 렌더링됨");
  return (
    <Suspense fallback={Loading}>
        <MainLayout>
            <Outlet />
            
        </MainLayout>
    </Suspense>
  );
}