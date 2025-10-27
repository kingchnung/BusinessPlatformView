import React from "react";
import { Menu, Layout } from "antd";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ 추가
import LoginSection from "../component/LoginSection";

const { Header } = Layout;

const getTopMenuKey = (pathname) => {
  if (pathname.startsWith('/hr')) return 'hr';
  if (pathname.startsWith('/sales')) return 'sales';
  if (pathname.startsWith('/approvals')) return 'approvals';
  if (pathname.startsWith('/communications')) return 'boards';
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'Main'; // 기본값
};

const HeaderLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 현재 URL 추적
  const currentKey = getTopMenuKey(location.pathname); // ✅ 현재 선택된 메뉴 계산

  // ✅ 사용자 권한 확인
  let userRoles = [];
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) userRoles = JSON.parse(storedUser).roles || [];
  } catch (e) { console.error("사용자 정보 파싱 실패", e); }

  const isAdmin = userRoles.includes("ROLE_ADMIN") || userRoles.includes("ROLE_CEO");

  const menuItems = [
    { key: "Main", label: "메인" },
    { key: "hr", label: "인사" },
    { key: "sales", label: "영업" },
    { key: "work", label: "업무" },
    { key: "approvals", label: "전자결재" },
    { key: "boards", label: "사내게시판" },
  ];
  if (isAdmin) menuItems.push({ key: "admin", label: "관리" });

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#001529",
        color: "#fff",
        padding: "0 24px",
      }}
    >
      {/* 🔹 로고 */}
      <div
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginRight: 24,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onClick={() => navigate("/main")}
      >
        BizMate
      </div>

      {/* 🔹 메뉴 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[currentKey]} // ✅ 현재 경로 기반 포커스
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 400,
        }}
        onClick={({ key }) => navigate(`/${key.toLowerCase()}`)}
      />

      {/* 🔹 로그인 섹션 */}
      <div style={{ marginLeft: "auto" }}>
        <LoginSection />
      </div>
    </Header>
  );
};

export default HeaderLayout;
