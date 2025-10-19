import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout"; // 프로젝트의 공통 레이아웃

const Loading = <div>Loading...</div>;

export default function SalesRouter() {
  return (
      <Suspense fallback={Loading}>
        <Outlet />
      </Suspense>
  );
}