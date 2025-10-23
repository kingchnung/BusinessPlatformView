import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { salesMenuConfig } from "../sales/util/salesMenuConfig";
import { adminMenuConfig } from "../admin/util/adminMenuConfig";
import { mainMenuConfig } from "./mainMenuConfig";
import "./commonLayout_temp.css";

const { Sider } = Layout;

/* ========================================================
 ✅ 1️⃣ 권한 계층 정의 및 필터링 함수
======================================================== */
const ROLE_LEVELS = {
  ROLE_CEO: 4,
  ROLE_ADMIN: 3,
  ROLE_MANAGER: 2,
  ROLE_EMPLOYEE: 1,
};

/** 사용자 Role 배열에서 가장 높은 권한 레벨 계산 */
const getUserHighestLevel = (roles) =>
  roles.reduce((max, role) => Math.max(max, ROLE_LEVELS[role] || 0), 0);

/** 메뉴를 Role 기반으로 재귀 필터링 */
const filterMenusByRole = (menuConfig, userRoles) => {
  const userLevel = getUserHighestLevel(userRoles);

  return menuConfig
    .map((menu) => {
      if (menu.children) {
        const filteredChildren = filterMenusByRole(menu.children, userRoles);
        return { ...menu, children: filteredChildren };
      }
      return menu;
    })
    .filter((menu) => {
      const requiredLevel = menu.role ? ROLE_LEVELS[menu.role] || 0 : 0;
      const hasAccess = userLevel >= requiredLevel;

      // 접근 불가 or 하위 비어있는데 path도 없는 상위 메뉴 제외
      if (!hasAccess) return false;
      if (menu.children && menu.children.length === 0 && !menu.path) return false;
      return true;
    });
};

/* ========================================================
 ✅ 2️⃣ 경로 기반 메뉴 탐색 유틸
======================================================== */
const getMenuConfig = (pathname) => {
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  if (pathname.startsWith("/sales")) return salesMenuConfig;
  if (pathname.startsWith("/admin")) return adminMenuConfig;
  if (pathname === "/" || pathname.startsWith("/main")) return mainMenuConfig;
  return [];
};

/** 현재 경로와 가장 일치하는 메뉴 key 찾기 */
const getSelectedKeys = (pathname, menuConfig) => {
  let selected = [];
  let bestMatchLength = 0;

  const findKey = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item.path && pathname.startsWith(item.path)) {
        if (item.path.length >= bestMatchLength) {
          selected = [item.path];
          bestMatchLength = item.path.length;
        }
      }
      if (item.children) findKey(item.children);
    });
  };
  findKey(menuConfig);
  return selected;
};

/** 현재 경로에 해당하는 상위 메뉴의 key 찾기 (open 유지용) */
const getOpenKeys = (pathname, menuConfig) => {
  for (const menu of menuConfig) {
    if (
      menu.children &&
      menu.children.some((child) => pathname.startsWith(child.path))
    ) {
      return [menu.key];
    }
  }
  return [];
};

/* ========================================================
 ✅ 3️⃣ 메인 컴포넌트
======================================================== */
const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState([]);

  /* ✅ 사용자 권한 가져오기 (localStorage.user 기준) */
  const userRoles = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.roles || [];
      }
    } catch (err) {
      console.error("권한 정보 파싱 실패:", err);
    }
    return [];
  }, []);

  /* ✅ 경로별 기본 메뉴 설정 */
  const baseMenuConfig = useMemo(
    () => getMenuConfig(location.pathname),
    [location.pathname]
  );

  /* ✅ 권한 기반 메뉴 필터링 */
  const filteredMenu = useMemo(
    () => filterMenusByRole(baseMenuConfig, userRoles),
    [baseMenuConfig, userRoles]
  );

  /* ✅ 메뉴 렌더링용 변환 (Ant Design v5 items 구조) */
  const menuItems = useMemo(
    () =>
      filteredMenu.map((menu) => ({
        key: menu.path || menu.key,
        icon: menu.icon,
        label: (
          <span className={menu.role ? "admin-menu-label" : ""}>
            {menu.label}
          </span>
        ),
        children: menu.children
          ? menu.children.map((child) => ({
              key: child.path || child.key,
              icon: child.icon,
              label: (
                <span className={child.role ? "admin-menu-label" : ""}>
                  {child.label}
                </span>
              ),
            }))
          : undefined,
      })),
    [filteredMenu]
  );

  /* ✅ 경로 변경 시 선택 및 열림 상태 업데이트 */
  const selectedKeys = useMemo(
    () => getSelectedKeys(location.pathname, filteredMenu),
    [location.pathname, filteredMenu]
  );

  useEffect(() => {
    const keys = getOpenKeys(location.pathname, filteredMenu);
    setOpenKeys(keys);
  }, [location.pathname, filteredMenu]);

  /* ✅ 메뉴 클릭 시 이동 */
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return menuItems.length > 0 ? (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        items={menuItems}
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        onOpenChange={setOpenKeys}
        onClick={handleMenuClick}
      />
    </Sider>
  ) : null;
};

export default SideLayout;
