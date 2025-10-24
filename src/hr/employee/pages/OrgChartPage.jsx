import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getDepartments } from "../../department/slice/departmentSlice";
import { getEmployees } from "../slice/hrSlice";
import OrgChartTreeView from "../components/OrgChartTreeView";
import OverviewStats from "../../department/components/OverviewStats";
/**
 * ==========================================
 * ✅ OrgChartPage (트리형 조직도 페이지)
 * - 부서 트리 + 직원 연결
 * ==========================================
 */
const OrgChartPage = () => {
  const dispatch = useDispatch();
  const { departments, loading: deptLoading } = useSelector(
    (state) => state.department
  );
  const { employees, loading: empLoading } = useSelector(
    (state) => state.hr || state.employee // hrSlice or employeeSlice
  );
  const [orgTree, setOrgTree] = useState([]);

  /** 1️⃣ 데이터 로드 */
  useEffect(() => {
    dispatch(getDepartments());
    dispatch(getEmployees());
  }, [dispatch]);

  /** 2️⃣ 트리 구성 */
  useEffect(() => {
    if (departments.length === 0 || employees.length === 0) return;

    // 부서 map 생성
    const deptMap = {};
    departments.forEach((dept) => {
      deptMap[dept.deptId] = { ...dept, children: [], employees: [] };
    });

    // 하위 부서 연결
    departments.forEach((dept) => {
      if (dept.parentDeptId && deptMap[dept.parentDeptId]) {
        deptMap[dept.parentDeptId].children.push(deptMap[dept.deptId]);
      }
    });

    // 루트 부서 찾기
    const roots = departments
      .filter((d) => !d.parentDeptId)
      .map((r) => deptMap[r.deptId]);

    // 직원 연결
    employees.forEach((emp) => {
      const deptName = emp.deptName || emp.departmentName;
      const match = Object.values(deptMap).find((d) => d.deptName === deptName);
      if (match) {
        match.employees.push(emp);
      } else {
        console.warn("🚫 매칭 실패 직원:", emp.empName, deptName);
      }
    });

    console.log("📊 완성된 트리:", roots);
    setOrgTree(roots);
  }, [departments, employees]);

  const isLoading = deptLoading || empLoading;

  return (
    <Spin spinning={isLoading} tip="조직도 불러오는 중...">
      <OverviewStats employees={employees}/>
      <Card
        title="조직도 조회"
        style={{
          margin: 16,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        {orgTree.length > 0 ? (
          orgTree.map((root) => (
            <OrgChartTreeView key={root.deptId} node={root} />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            표시할 조직이 없습니다.
          </p>
        )}
      </Card>
    </Spin>
  );
};

export default OrgChartPage;
