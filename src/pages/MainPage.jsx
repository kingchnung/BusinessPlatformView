import { Children } from "react";
import MainLayout from "../layouts/MainLayout";


const MainPage = ({Children}) => {
    return (
        <>
            <MainLayout>
                {Children}
            </MainLayout>
        </>
    )
}

export default MainPage;