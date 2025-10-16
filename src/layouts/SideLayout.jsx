import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath"; // ✅ 추가

const { Sider } = Layout;

const getMenuConfig = (pathname) => {
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  return [{ key: "main", label: "메인", path: "/" }];
};

const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let userRoles = [];
  try {
    const stored = localStorage.getItem("roles");
    if (stored) userRoles = JSON.parse(stored);
  } catch (err) {
    console.error("권한 정보 파싱 실패:", err);
  }

  const baseMenuConfig = useMemo(() => getMenuConfig(location.pathname), [location.pathname]);

  // ✅ 권한 기반으로 path 조정
  const adjustedMenuConfig = useMemo(
    () => applyRoleBasedMenuPath(baseMenuConfig, userRoles),
    [baseMenuConfig, userRoles]
  );

  // ✅ 역할별 메뉴 필터링
  const filteredMenu = useMemo(() => {
    if (adjustedMenuConfig.length === 0) return [];
    const copiedMenu = JSON.parse(JSON.stringify(adjustedMenuConfig));

    return copiedMenu
      .map((menu) => {
        if (menu.children) {
          menu.children = menu.children.filter((item) => {
            if (userRoles.includes("ROLE_CEO")) return true;
            if (userRoles.includes("ROLE_MANAGER")) return item.key !== "empCardDelete";
            if (userRoles.includes("ROLE_EMPLOYEE"))
              return item.key === "empCardView" || item.key === "empCardEdit";
            return item.key === "empCardView";
          });
        }
        return menu;
      })
      .filter((menu) => !menu.children || menu.children.length > 0 || menu.path);
  }, [adjustedMenuConfig, userRoles]);

  return (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        defaultOpenKeys={["empCard"]}
        selectedKeys={[location.pathname]}
        onClick={({ item }) => {
          if (item.props.path) navigate(item.props.path);
        }}
        items={filteredMenu.map((m) => ({
          key: m.path || m.key,
          icon: m.icon,
          label: m.label,
          path: m.path,
          children: m.children
            ? m.children.map((c) => ({
                key: c.path || c.key,
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
