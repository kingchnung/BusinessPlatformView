import { Layout } from 'antd';
import HeaderLayout from './HeaderLayout';
import SideLayout from './SideLayout';
import FooterLayout from './FooterLayout';

const MainLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderLayout />
            <Layout>
                <SideLayout />
                    {children}
            </Layout>
            <FooterLayout />
        </Layout>
    );
};

export default MainLayout;