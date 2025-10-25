/**
 * [departmentUtils.js]
 * 부서 관련 공통 유틸 함수
 */

/**
 * 부서 ID로 부서장의 이름을 반환
 * @param {number} deptId - 부서 ID
 * @param {Array} departments - 부서 목록 (managerId 포함)
 * @param {Array} employees - 전체 직원 목록
 * @returns {string} 부서장 이름 or "-"
 */
export const getManagerNameByDeptId = (deptId, departments = [], employees = []) => {
  if (!deptId || !Array.isArray(departments) || !Array.isArray(employees)) return "-";

  // 1️⃣ 부서 찾기
  const dept = departments.find((d) => d.deptId === deptId);
  if (!dept || !dept.managerId) return "-";

  // 2️⃣ 부서장의 직원 정보 찾기
  const manager = employees.find((e) => e.empId === dept.managerId);
  return manager ? manager.empName : "-";
};
