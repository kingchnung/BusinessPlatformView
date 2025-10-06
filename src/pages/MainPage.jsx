
import MainLayout from "../layouts/MainLayout";


const MainPage = ({children}) => {
    return (
        <>
            <MainLayout>
                {children}
            </MainLayout>
        </>
    )
}

export default MainPage;