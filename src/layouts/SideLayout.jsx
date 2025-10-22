import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

// 메뉴 설정 파일
import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { adminMenuConfig } from "../admin/util/adminMenuConfig";
import { salesMenuConfig } from "../sales/util/salesMenuConfig";
import { mainMenuConfig } from "./mainMenuConfig";

// HR 메뉴 경로 조정 함수
import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath";

import "./commonLayout_temp.css";
import { approvalMenuConfig } from "../groupware/approval/util/approvalMenuConfig";
import { boardMenuConfig } from "../groupware/board/util/boardMenuConfig";

const { Sider } = Layout;

/* ---------------------------------------------------------------------------
 * ✅ 1. 역할 기반 메뉴 필터링 함수 (재귀적 처리)
 * ------------------------------------------------------------------------- */
const filterMenusByRole = (menuConfig, userRoles) => {
  const ROLE_LEVELS = {
    ROLE_CEO: 4,
    ROLE_ADMIN: 3,
    ROLE_MANAGER: 2,
    ROLE_EMPLOYEE: 1,
  };

  const getUserHighestLevel = (roles) => {
    let highestLevel = 0;
    roles.forEach((role) => {
      const level = ROLE_LEVELS[role];
      if (level > highestLevel) highestLevel = level;
    });
    return highestLevel;
  };

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

      if (!hasAccess) return false;
      if (menu.children && menu.children.length === 0 && !menu.path) return false;
      return true;
    });
};

/* ---------------------------------------------------------------------------
 * ✅ 2. 경로 기반 헬퍼 함수
 * ------------------------------------------------------------------------- */
// 경로에 맞는 메뉴 구성 가져오기
const getMenuConfig = (pathname) => {
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  if (pathname.startsWith("/sales")) return salesMenuConfig;
  if (pathname.startsWith("/admin")) return adminMenuConfig;
  if (pathname.startsWith("/approvals")) return approvalMenuConfig;
  if (pathname.startsWith("/boards")) return boardMenuConfig;
  if (pathname === "/" || pathname.startsWith("/main")) return mainMenuConfig;
  return [];
};

// 상위 메뉴(열림 상태) 키 찾기
const getOpenKeys = (pathname, menuConfig) => {
  if (!Array.isArray(menuConfig)) return [];
  for (const menu of menuConfig) {
    if (menu.children && menu.children.some(child => child.path && pathname.startsWith(child.path))) {
      return [menu.key];
    }
  }
  return [];
};

// 선택된 메뉴 키 찾기
const getSelectedKeys = (pathname, menuConfig) => {
  if (!Array.isArray(menuConfig)) return [];
  let selected = [];
  let bestMatchLength = 0;

  const findKey = (items) => {
    items.forEach(item => {
      if (item.path && pathname.startsWith(item.path)) {
        if (item.path.length >= bestMatchLength) {
          if (pathname === item.path || item.path.length > bestMatchLength) {
            selected = [item.key];
            bestMatchLength = item.path.length;
          }
        }
      }
      if (item.children) findKey(item.children);
    });
  };

  findKey(menuConfig);
  return selected;
};

/* ---------------------------------------------------------------------------
 * ✅ 3. 통합 SideLayout 컴포넌트
 * ------------------------------------------------------------------------- */
const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentOpenKeys, setCurrentOpenKeys] = useState([]);

  /* ✅ 사용자 역할 가져오기 */
  const userRoles = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return Array.isArray(parsed.roles) ? parsed.roles : [];
      }
    } catch (err) {
      console.error("[SideLayout] 사용자 권한 파싱 실패:", err);
    }
    return [];
  }, []);

  /* ✅ 현재 경로에 맞는 메뉴 구성 가져오기 */
  const baseMenuConfig = useMemo(() => getMenuConfig(location.pathname), [location.pathname]);

  /* ✅ HR 메뉴일 경우, 경로 조정 적용 */
  const adjustedMenuConfig = useMemo(() => {
    if (baseMenuConfig === hrMenuConfig && typeof applyRoleBasedMenuPath === "function") {
      return applyRoleBasedMenuPath(baseMenuConfig, userRoles);
    }
    return baseMenuConfig;
  }, [baseMenuConfig, userRoles]);

  /* ✅ 역할 기반 메뉴 필터링 적용 */
  const filteredMenu = useMemo(
    () => filterMenusByRole(adjustedMenuConfig, userRoles),
    [adjustedMenuConfig, userRoles]
  );

  /* ✅ 메뉴 열림(openKeys) 상태 동기화 */
  useEffect(() => {
    if (baseMenuConfig !== mainMenuConfig) {
      setCurrentOpenKeys(getOpenKeys(location.pathname, filteredMenu));
    } else {
      setCurrentOpenKeys([]);
    }
  }, [location.pathname, filteredMenu, baseMenuConfig]);

  const handleOpenChange = (keys) => setCurrentOpenKeys(keys);

  /* ✅ 현재 선택된 메뉴 */
  const selectedKeys = useMemo(
    () => getSelectedKeys(location.pathname, filteredMenu),
    [location.pathname, filteredMenu]
  );

  /* ✅ 메뉴 항목 변환 (Ant Design 형식) */
  const mapMenuItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      key: item.path || item.key,
      icon: item.icon,
      label: (
        <span className={item.role ? "admin-menu-label" : ""}>
          {item.label}
        </span>
      ),
      children: item.children ? mapMenuItems(item.children) : undefined,
    }));
  };

  const menuItems = useMemo(() => mapMenuItems(filteredMenu), [filteredMenu]);

  /* ✅ 메뉴 클릭 시 페이지 이동 */
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    menuItems.length > 0 ? (
      <Sider width={200} theme="dark">
        <Menu
          mode="inline"
          openKeys={currentOpenKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
    ) : null
  );
};

export default SideLayout;
