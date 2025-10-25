import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const Loading = <div>Loading...</div>;

export default function AdminRouter() {
  return (
    <Suspense fallback={Loading}>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </Suspense>
  );
}