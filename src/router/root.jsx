import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";


const Loading = <div> <h1>로딩 중입니다</h1></div>;

const Main = lazy(() => import("../pages/MainPage"));

const Project = lazy(() => import ("../pages/ProjectPage"));

const root = createBrowserRouter([
    {
        path:"",
        element: <Suspense fallback={Loading}><Main/></Suspense>
    },
    {
        path: "project",
        element: <Suspense fallback={Loading}><Project/></Suspense>
    }
]);

export default root;