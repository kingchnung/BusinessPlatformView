import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const Loading = <div>Loading...</div>;

export default function SalesRouter() {
  return (
      <Suspense fallback={Loading}>
        <Outlet />
      </Suspense>
  );
}