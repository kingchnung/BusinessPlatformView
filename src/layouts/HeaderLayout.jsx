import React, {useMemo} from "react";
import { Menu, Layout } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import LoginSection from "../component/LoginSection";

const { Header } = Layout;

const getTopMenuKey = (pathname) => {
  if (pathname.startsWith('/hr')) return '/hr';
  if (pathname.startsWith('/sales')) return '/sales';
  if (pathname.startsWith('/approvals')) return '/approvals';
  if (pathname.startsWith('/communications')) return '/communications';
  if (pathname.startsWith('/project')) return '/project';
  if (pathname === '/' || pathname === '/main') return '/';
  return '/';
};

const HeaderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTopMenuKey = useMemo(() => getTopMenuKey(location.pathname), [location.pathname]);
 
  const menuItems = [
    { key: "main", label: "메인" },
    { key: "hr", label: "인사" },
    { key: "sales", label: "영업" },
    { key: "Project", label: "프로젝트" },
    { key: "approvals", label: "전자결재" },
    { key: "communications", label: "사내게시판" },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // 🔹 로고-메뉴-로그인영역 균등 정렬
        background: "#001529",
        color: "#fff",
        padding: "0 24px",
      }}
    >
      {/* 🔹 로고 영역 */}
      <div
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginRight: 24,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onClick={() => navigate("/")}
      >
        BizMate
      </div>

      {/* 🔹 메뉴 영역 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[currentTopMenuKey]}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 400,
        }}
        onClick={({ key }) => navigate(`/${key.toLowerCase()}`)}
      />

      {/* 🔹 로그인 / 로그아웃 영역 */}
      <div style={{ marginLeft: "auto" }}>
        <LoginSection />
      </div>
    </Header>
  );
};

export default HeaderLayout;
