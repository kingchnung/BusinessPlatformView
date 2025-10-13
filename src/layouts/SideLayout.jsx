import React from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TeamOutlined,
  UserOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hrMenu = [
    {
      key: "org",
      icon: <TeamOutlined />,
      label: "조직도 조회",
      path: "/hr",
    },
    {
      key: "empCard",
      icon: <UserOutlined />,
      label: "인사카드 관리",
      children: [
        {
          key: "empCardView",
          label: "인사카드 조회",
          path: "/hr/employee/cards",
        },
        {
          key: "empCardAdd",
          label: "인사카드 등록",
          path: "/hr/employee/cards/add",
          adminOnly: true, // ✅ 관리자 전용
          icon: <FileAddOutlined />,
        },
        {
          key: "empCardDelete",
          label: "인사카드 삭제",
          path: "/hr/employee/cards/delete",
          adminOnly: true, // ✅ 관리자 전용
          icon: <DeleteOutlined />,
        },
      ],
    },
  ];

  const defaultMenu = [
    { key: "main", label: "메인", path: "/" },
  ];

  let userRoles = [];

  try {
    const stored = localStorage.getItem("roles");
    if (stored) userRoles = JSON.parse(stored); // 문자열 → 배열
  } catch (err) {
    console.error("권한 정보 파싱 실패:", err);
  }

  console.log("✅ 사용자 권한:", userRoles);

  
  const filteredMenu = hrMenu.map((menu) => {
    if (menu.children) {
      menu.children = menu.children.filter(
        (item) => 
        !item.adminOnly || 
        userRoles.includes("ROLE_MANAGER") ||
        userRoles.includes("ROLE_ADMIN") ||
        userRoles.includes("ROLE_CEO")
      );
    }
    return menu;
  });

  const menuItems = location.pathname.startsWith("/hr")
    ? filteredMenu
    : defaultMenu;

  return (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        defaultOpenKeys={["empCard"]}
        selectedKeys={[location.pathname]}
        onClick={({ item }) => {
          if (item.props.path) navigate(item.props.path);
        }}
        items={menuItems.map((m) => ({
          key: m.key,
          icon: m.icon,
          label: m.label,
          path: m.path,
          children: m.children
            ? m.children.map((c) => ({
                key: c.key,
                label: c.label,
                path: c.path,
                icon: c.icon,
              }))
            : undefined,
        }))}
      />
    </Sider>
  );
};

export default SideLayout;
