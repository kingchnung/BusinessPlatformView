import { Layout } from 'antd';
import HeaderLayout from './HeaderLayout';
import SideLayout from './SideLayout';
import FooterLayout from './FooterLayout';

const {Content} = Layout;

const MainLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderLayout />
            <Layout>
                <SideLayout />
                <Content style={{ margin: "16px", padding: "16px", background: "#fff" }}>
                    {children}
                </Content>
            </Layout>
            <FooterLayout />
        </Layout>
    );
};

export default MainLayout;