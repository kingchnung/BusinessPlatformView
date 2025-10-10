import React from "react";
import { Menu, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import LoginSection from "../component/LoginSection";

const { Header } = Layout;

const HeaderLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "Main", label: "Main" },
    { key: "Employee", label: "Employee" },
    { key: "Sales", label: "Sales" },
    { key: "Project", label: "Project" },
    { key: "Groupware", label: "Groupware" },
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
        defaultSelectedKeys={["Main"]}
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
