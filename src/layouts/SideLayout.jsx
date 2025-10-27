import React, { useMemo, useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { boardMenuConfig } from "../groupware/board/util/boardMenuConfig";
import { approvalMenuConfig } from "../groupware/util/approvalMenuConfig";
import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { salesMenuConfig } from "../sales/util/salesMenuConfig";
import { mainMenuConfig } from "./mainMenuConfig";
import { workMenuConfig } from "../work/util/wokMenuConfig";
import { adminMenuConfig } from "../admin/util/adminMenuConfig";
import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath";
import "./commonLayout_temp.css";

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

const getUserHighestLevel = (roles = []) =>
  roles.reduce((max, role) => Math.max(max, ROLE_LEVELS[role] || 0), 0);

/* ========================================================
 ✅ 2️⃣ 메뉴 필터링
======================================================== */
const filterMenusByRole = (menuConfig, userRoles = []) => {
  const userLevel = getUserHighestLevel(userRoles);
  if (!Array.isArray(menuConfig)) return [];

  return menuConfig
    .map((menu) => {
      const children = menu.children
        ? filterMenusByRole(menu.children, userRoles)
        : undefined;

      const requiredLevel = menu.role ? ROLE_LEVELS[menu.role] || 0 : 0;
      const hasAccess = userLevel >= requiredLevel;

      if (!hasAccess) return null;
      if (children && children.length === 0 && !menu.path) return null;

      return { ...menu, children };
    })
    .filter(Boolean);
};

/* ========================================================
 ✅ 3️⃣ 메뉴 탐색 유틸
======================================================== */
const getMenuConfig = (pathname) => {
  if (pathname.startsWith("/hr")) return hrMenuConfig;
  if (pathname.startsWith("/sales")) return salesMenuConfig;
  if (pathname.startsWith("/admin")) return adminMenuConfig;
  if (pathname.startsWith("/approvals")) return approvalMenuConfig;
  if (pathname.startsWith("/boards")) return boardMenuConfig;
  if (pathname.startsWith("/work")) return workMenuConfig;
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

  /* ✅ 현재 메뉴 구조 결정 */
  const baseMenuConfig = useMemo(
    () => getMenuConfig(location.pathname),
    [location.pathname]
  );

  const adjustedMenuConfig = useMemo(() => {
    if (baseMenuConfig === hrMenuConfig && typeof applyRoleBasedMenuPath === "function") {
      return applyRoleBasedMenuPath(baseMenuConfig, userRoles);
    }
    return baseMenuConfig;
  }, [baseMenuConfig, userRoles]);

  const filteredMenu = useMemo(
    () => filterMenusByRole(adjustedMenuConfig, userRoles),
    [adjustedMenuConfig, userRoles]
  );

  /* ✅ 메뉴 items 변환 (관리자 메뉴 색상 표시) */
  const mapMenuItems = (items) =>
    items.map((item) => {
      const isAdminMenu =
        item.role === "ROLE_ADMIN" || item.role === "ROLE_CEO" || item.role === "ROLE_MANAGER";

      return {
        key: item.key,
        icon: item.icon,
        label: (
          <span style={isAdminMenu ? { color: "tomato", fontWeight: 600 } : {}}>
            {item.label}
          </span>
        ),
        children: item.children ? mapMenuItems(item.children) : undefined,
      };
    });

  const menuItems = useMemo(() => mapMenuItems(filteredMenu), [filteredMenu]);

  /* ✅ 선택 상태 */
  const selectedKeys = useMemo(
    () => getSelectedKeys(location.pathname, filteredMenu),
    [location.pathname, filteredMenu]
  );

  /* ✅ 자동 open 처리 + 클릭 유지 */
  useEffect(() => {
    const autoKeys = getOpenKeys(location.pathname, filteredMenu);
    setOpenKeys((prev) => {
      // 중복 방지 & 기존 오픈된 메뉴 유지
      const merged = Array.from(new Set([...prev, ...autoKeys]));
      return merged;
    });
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

    findPathByKey(filteredMenu);
    if (targetPath) navigate(targetPath);
    else console.warn("경로를 찾을 수 없습니다:", key);
  };

  return menuItems.length > 0 ? (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        items={menuItems}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)} // ✅ 수동 열기 반영
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
      />
    </Sider>
  ) : null;
};

export default SideLayout;
