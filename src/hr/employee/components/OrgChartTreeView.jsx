import React from "react";
import { Typography } from "antd";
import EmployeeCard from "./EmployeeCarditem";

const { Title } = Typography;

/**
 * ✅ OrgChartTreeView
 * - 부서 → 하위부서 → 직원 트리 재귀 렌더링
 */
const OrgChartTreeView = ({ node }) => {
  return (
    <div
      style={{
        marginLeft: node.parentDeptId ? 40 : 0,
        borderLeft: node.parentDeptId ? "2px solid #ddd" : "none",
        paddingLeft: node.parentDeptId ? 20 : 0,
        marginBottom: 24,
      }}
    >
      {/* 부서명 */}
      <Title level={5} style={{ color: "#1677ff", marginBottom: 8 }}>
        {node.deptName}
      </Title>

      {/* 직원 카드 리스트 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
          justifyContent: "flex-start",
        }}
      >
        {node.employees?.length > 0 ? (
          node.employees.map((emp) => (
            <EmployeeCard key={emp.empId} emp={emp} />
          ))
        ) : (
          <p style={{ color: "#bbb" }}>소속 직원 없음</p>
        )}
      </div>

      {/* 하위 부서 재귀 렌더링 */}
      {node.children?.map((child) => (
        <OrgChartTreeView key={child.deptId} node={child} />
      ))}
    </div>
  );
};

export default OrgChartTreeView;
