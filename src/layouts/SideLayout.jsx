import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { salesMenuConfig } from "../sales/util/salesMenuConfig";
import { mainMenuConfig } from "./mainMenuConfig";
import { approvalMenuConfig } from "../groupware/util/approvalMenuConfig";
import { adminMenuConfig } from "../admin/util/adminMenuConfig"; // 🔹 관리자 메뉴 추가
import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath"; // HR 전용 조정


const { Sider } = Layout;

/* ========================================================
 ✅ 1️⃣ 역할(Role) 기반 계층 정의
======================================================== */
const ROLE_LEVELS = {
  ROLE_CEO: 4,
  ROLE_ADMIN: 3,
  ROLE_MANAGER: 2,
  ROLE_EMPLOYEE: 1,
};

/** 사용자의 최고 권한 레벨 반환 */
const getUserHighestLevel = (roles = []) =>
  roles.reduce((max, role) => Math.max(max, ROLE_LEVELS[role] || 0), 0);

/* ========================================================
 ✅ 2️⃣ 메뉴 필터링 (권한 기반)
======================================================== */
const filterMenusByRole = (menuConfig, userRoles = []) => {
  const userLevel = getUserHighestLevel(userRoles);
  if (!Array.isArray(menuConfig)) return [];

  return menuConfig
    .map((menu) => {
      // 하위 메뉴 재귀 필터링
      const children = menu.children
        ? filterMenusByRole(menu.children, userRoles)
        : undefined;

      const requiredLevel = menu.role ? ROLE_LEVELS[menu.role] || 0 : 0;
      const hasAccess = userLevel >= requiredLevel;

      // 접근 불가 or 자식 없는 상위 폴더 제외
      if (!hasAccess) return null;
      if (children && children.length === 0 && !menu.path) return null;

      return { ...menu, children };
    })
    .filter(Boolean);
};

/* ========================================================
 ✅ 3️⃣ 경로 기반 메뉴 탐색 유틸
======================================================== */
const getMenuConfig = (pathname) => {
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  if (pathname.startsWith("/sales")) return salesMenuConfig;
  if (pathname.startsWith("/admin")) return adminMenuConfig;
  if (pathname.startsWith("/approvals")) return approvalMenuConfig;
  if (pathname === "/" || pathname.startsWith("/main")) return mainMenuConfig;
  return [];
};

const getOpenKeys = (pathname, menuConfig) => {
  for (const menu of menuConfig) {
    if (
      menu.children &&
      menu.children.some((child) => child.path && pathname.startsWith(child.path))
    ) {
      return [menu.key];
    }
  }
  return [];
};

const getSelectedKeys = (pathname, menuConfig) => {
  let selected = [];
  let bestMatchLength = 0;

  const findKey = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (item.path && pathname.startsWith(item.path)) {
        if (item.path.length >= bestMatchLength) {
          selected = [item.key];
          bestMatchLength = item.path.length;
        }
      }
      if (item.children) findKey(item.children);
    });
  };

  findKey(menuConfig);
  return selected;
};

/* ========================================================
 ✅ 4️⃣ 메인 컴포넌트
======================================================== */
const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState([]);

  /* ✅ 사용자 roles 가져오기 */
  const userRoles = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.roles || [];
      }
    } catch (err) {
      console.error("권한 정보 파싱 실패:", err);
    }
    return [];
  }, []);

  /* ✅ 현재 경로 기반 메뉴 결정 */
  const baseMenuConfig = useMemo(
    () => getMenuConfig(location.pathname),
    [location.pathname]
  );

  /* ✅ HR 전용 메뉴 경로 조정 */
  const adjustedMenuConfig = useMemo(() => {
    if (baseMenuConfig === hrMenuConfig && typeof applyRoleBasedMenuPath === "function") {
      return applyRoleBasedMenuPath(baseMenuConfig, userRoles);
    }
    return baseMenuConfig;
  }, [baseMenuConfig, userRoles]);

  /* ✅ 권한 기반 메뉴 필터링 */
  const filteredMenu = useMemo(
    () => filterMenusByRole(adjustedMenuConfig, userRoles),
    [adjustedMenuConfig, userRoles]
  );

  /* ✅ 메뉴 items 변환 */
  const mapMenuItems = (items) =>
    items.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      children: item.children ? mapMenuItems(item.children) : undefined,
    }));

  const menuItems = useMemo(() => mapMenuItems(filteredMenu), [filteredMenu]);

  /* ✅ 선택/열림 상태 계산 */
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
    let targetPath = null;

    const findPathByKey = (items) => {
      for (const item of items) {
        if (item.key === key && item.path) {
          targetPath = item.path;
          return true;
        }
        if (item.children && findPathByKey(item.children)) return true;
      }
      return false;
    };

    findPathByKey(baseMenuConfig);

    if (targetPath) navigate(targetPath);
    else console.warn("경로를 찾을 수 없습니다:", key);
  };

  return menuItems.length > 0 ? (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        items={menuItems}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
      />
    </Sider>
  ) : null;
};

export default SideLayout;
