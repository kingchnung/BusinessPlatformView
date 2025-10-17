import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { hrMenuConfig } from "../hr/util/hrMenuConfig";
import { adminMenuConfig } from "../admin/util/adminMenuConfig";
// applyRoleBasedMenuPath는 현재 코드에서 사용되지 않으므로, 필요 없다면 제거해도 됩니다.
// import { applyRoleBasedMenuPath } from "../hr/util/applyRoleBasedMenuPath";

const { Sider } = Layout;

/**
 * ✅ [핵심 변경] 권한에 따라 메뉴를 필터링하는 재귀 함수
 * - 메뉴 설정 파일(hrMenuConfig)에 정의된 role을 기반으로 동작합니다.
 * - 하위 메뉴까지 모두 검사하여 보여줄 메뉴만 남깁니다.
 * @param {Array} menuConfig - 필터링할 메뉴 배열
 * @param {Array} userRoles - 사용자가 가진 역할(role) 배열
 * @returns {Array} - 필터링이 완료된 메뉴 배열
 */
const filterMenusByRole = (menuConfig, userRoles) => {
  // 사용자의 최고 권한을 숫자로 변환하여 계층 구조를 쉽게 비교합니다.
  const ROLE_LEVELS = {
    ROLE_CEO: 4,
    ROLE_ADMIN: 3,
    ROLE_MANAGER: 2,
    ROLE_EMPLOYEE: 1,
  };

  // 사용자가 가진 역할 중 가장 높은 레벨을 찾는 함수
  const getUserHighestLevel = (roles) => {
    let highestLevel = 0;
    roles.forEach(role => {
      const level = ROLE_LEVELS[role];
      if (level > highestLevel) {
        highestLevel = level;
      }
    });
    return highestLevel;
  };
  
  const userLevel = getUserHighestLevel(userRoles);

  return menuConfig
    .map((menu) => {
      // 1. 하위 메뉴가 있으면, 하위 메뉴부터 재귀적으로 필터링합니다.
      if (menu.children) {
        const filteredChildren = filterMenusByRole(menu.children, userRoles);
        // 필터링된 하위 메뉴를 현재 메뉴의 children으로 교체합니다.
        return { ...menu, children: filteredChildren };
      }
      // 2. 하위 메뉴가 없으면 그대로 반환합니다.
      return menu;
    })
    .filter((menu) => {
      // 3. 메뉴별 접근 가능 여부를 최종적으로 결정합니다.
      const requiredLevel = menu.role ? ROLE_LEVELS[menu.role] || 0 : 0;

      // 메뉴에 필요한 권한이 없거나(누구나 접근 가능), 사용자 권한이 더 높거나 같은 경우
      const hasAccess = userLevel >= requiredLevel;

      if (!hasAccess) {
        return false; // 접근 권한이 없으면 메뉴를 표시하지 않습니다.
      }
      
      // 접근 권한이 있더라도, 하위 메뉴가 모두 필터링되어 비어있다면
      // 상위 메뉴(폴더 역할)도 표시하지 않습니다. (단, 상위 메뉴 자체가 링크(path)를 가진 경우는 예외)
      if (menu.children && menu.children.length === 0 && !menu.path) {
        return false;
      }

      return true; // 위 모든 조건에 해당하지 않으면 메뉴를 표시합니다.
    });
};


const SideLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let userRoles = [];
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userRoles = parsedUser.roles || [];
    }
  } catch (err)
  {
    console.error("권한 정보 파싱 실패:", err);
  }

  const baseMenuConfig = useMemo(() => {
    if (location.pathname.startsWith("/hr")) return hrMenuConfig;
    if (location.pathname.startsWith("/admin")) return adminMenuConfig;
    return [{ key: "main", label: "메인", path: "/" }];
  }, [location.pathname]);

  // ✅ [핵심 변경] 새로 만든 필터링 함수를 사용하여 메뉴를 구성합니다.
  const filteredMenu = useMemo(
    () => filterMenusByRole(baseMenuConfig, userRoles),
    [baseMenuConfig, userRoles]
  );

  return (
    <Sider width={200} theme="dark">
      <Menu
        mode="inline"
        // defaultOpenKeys는 동적으로 설정하거나, 가장 첫 번째 메뉴를 열도록 설정하는 것이 좋습니다.
        defaultOpenKeys={filteredMenu.length > 0 ? [filteredMenu[0].key] : []}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          // Ant Design의 Menu 컴포넌트는 onClick의 인자로 key를 바로 줍니다.
          // path를 직접 전달하는 것이 더 명확할 수 있습니다.
          // 아래 items 속성에서 path를 key로 사용하도록 수정했습니다.
          navigate(key);
        }}
        // Ant Design v5+ 에서는 items 속성 사용을 권장합니다.
        items={filteredMenu.map((menu) => ({
          key: menu.path || menu.key, // path가 있으면 key로 사용하여 navigate와 연동
          icon: menu.icon,
          label: menu.label,
          children: menu.children
            ? menu.children.map((child) => ({
                key: child.path || child.key,
                label: child.label,
                icon: child.icon,
              }))
            : undefined,
        }))}
      />
    </Sider>
  );
};

export default SideLayout;