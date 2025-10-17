import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout"; // 프로젝트의 공통 레이아웃

const Loading = <div>Loading...</div>;

export default function SalesRouter() {
  return (
    // 모든 Sales 페이지는 MainLayout을 공통으로 사용합니다.
    <MainLayout>
      <Suspense fallback={Loading}>
        {/* 이 Outlet 자리에 STEP 1에서 정의한 페이지들이 렌더링됩니다. */}
        <Outlet />
      </Suspense>
    </MainLayout>
  );
}