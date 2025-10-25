/**
 * [departmentDivision.js]
 * 부서코드 규칙 기반으로 "부" / "팀" 구분
 *  - 10, 20, 30 → 본부(부)
 *  - 11, 12, 21, 22 → 팀
 */
export const divideDepartmentsByCode = (departments = []) => {
  if (!Array.isArray(departments)) return { divisions: [], teams: [] };

  const divisions = [];
  const teams = [];

  departments.forEach((dept) => {
    const code = parseInt(dept.deptCode, 10);
    if (isNaN(code)) return;

    // 🔹 10의 자리 확인
    const remainder = code % 10;

    if (remainder === 0) {
      divisions.push(dept); // 10, 20, 30 → 본부(부)
    } else {
      teams.push(dept); // 11, 12, 21, 22 → 팀
    }
  });

  return { divisions, teams };
};

/**
 * 특정 본부(부)의 하위 팀을 반환
 * ex) 10 → 11, 12
 */
export const getTeamsByDivisionCode = (departments = [], divisionCode) => {
  const prefix = Math.floor(parseInt(divisionCode, 10) / 10);
  return departments.filter((dept) => {
    const code = parseInt(dept.deptCode, 10);
    return Math.floor(code / 10) === prefix && code % 10 !== 0;
  });
};

/**
 * 부서타입 식별
 * @returns "division" | "team" | null
 */
export const getDepartmentTypeByCode = (dept) => {
  if (!dept || !dept.deptCode) return null;
  const code = parseInt(dept.deptCode, 10);
  return code % 10 === 0 ? "division" : "team";
};
