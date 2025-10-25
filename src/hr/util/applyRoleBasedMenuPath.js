/**
 * 권한(Role)에 따라 메뉴 path를 동적으로 조정하는 유틸
 * - hrMenuConfig 등 메뉴 설정을 복사하여 수정
 * - 다른 메뉴 세트에서도 재사용 가능
 *
 * @param {Array} menuConfig - 메뉴 설정 배열 (예: hrMenuConfig)
 * @param {Array} userRoles - 사용자 권한 배열 (예: ["ROLE_MANAGER", "ROLE_EMPLOYEE"])
 * @returns {Array} 권한별로 path가 조정된 메뉴 설정 배열
 */
export const applyRoleBasedMenuPath = (menuConfig, userRoles = []) => {
  if (!Array.isArray(menuConfig) || menuConfig.length === 0) return [];

  const copied = JSON.parse(JSON.stringify(menuConfig)); // 깊은 복사

  copied.forEach((menu) => {
    if (menu.children) {
      menu.children.forEach((item) => {
        // ✅ HR 메뉴의 인사카드 수정 경로
        if (item.key === "empCardEdit") {
          item.path =
            userRoles.includes("ROLE_MANAGER") || userRoles.includes("ROLE_CEO")
              ? "/hr/employee/cards/edit/select"
              : "/hr/employee/cards/edit";
        }

        // ✅ 다른 메뉴 세트에서도 유사 로직 추가 가능 (예시)
        if (item.key === "salesReport") {
          item.path = userRoles.includes("ROLE_SALES_ADMIN")
            ? "/sales/report/manage"
            : "/sales/report/view";
        }
      });
    }
  });

  return copied;
};
