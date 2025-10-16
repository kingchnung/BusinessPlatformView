import React, { useEffect, useState, useMemo, useCallback } from "react"; // ✅ useMemo 추가
import { Table, Card, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../common/axiosInstance";
import { divideDepartmentsByCode, getTeamsByDivisionCode } from "../../util/departmentDivision";
import OverviewStats from "../components/OverviewStats";
import EmployeeProvider from "../../employee/components/EmployeeProvider"; // ✅ EmployeeProvider import

/**
 * 📄 DepartmentOverviewPage.jsx
 * EmployeeProvider를 통해 전체 직원 데이터를 받아 부서별 통계를 직접 계산하는 페이지
 */
const DepartmentOverviewPage = () => {
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [employees, setEmployees] = useState([]);     // ✅ 전체 직원 목록을 저장할 state
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ EmployeeProvider가 데이터를 전달하면 employees state에 저장
  const handleEmployeesReady = useCallback((allEmployees) => {
    console.log("✅ 1. handleEmployeesReady: EmployeeProvider로부터 받은 데이터", allEmployees);
    setEmployees(allEmployees);
  }, []);

  // 부서 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/departments/overview");
        const allDepts = res.data;
        setDepartments(allDepts);

        const { divisions } = divideDepartmentsByCode(allDepts);
        const structured = divisions.map((div) => {
          const children = getTeamsByDivisionCode(allDepts, div.deptCode);
          return {
            key: div.deptId, ...div,
            children: children.map((team) => ({ key: team.deptId, ...team })),
          };
        });
        setTreeData(structured);
      } catch (err) {
        console.error(err);
        message.error("부서 현황 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ useMemo를 사용해 부서별 통계를 계산 (성능 최적화)
  // employees나 departments 데이터가 변경될 때만 재계산됩니다.
  const departmentStats = useMemo(() => {
    console.log("✅ 3. useMemo 실행: 계산 시작", { employees, departments });
    const statsMap = {};
    departments.forEach(dept => {
      statsMap[dept.deptId] = { breakCount: 0 };
    });

    employees.forEach(emp => {
      const deptId = emp.deptId;
      if (deptId && statsMap[deptId]) {
        const status = String(emp.status || "").toUpperCase();
        if (status === 'BREAK') {
          statsMap[deptId].breakCount += 1;
        }
      }
    });
    return statsMap;
  }, [employees, departments]);

  const handleRowClick = (record) => {
    if (record.deptCode % 10 === 0) return;
    navigate(`/hr/department/${record.deptId}`);
  };

  if (loading) return <Spin tip="부서 현황 불러오는 중..." />;

  const columns = [
    // ... (이전과 동일한 컬럼 정의)
    {
      title: "부서명", dataIndex: "deptName", key: "deptName",
      render: (text, record) => record.deptCode % 10 === 0 ? <strong>{text}</strong> : <span style={{ paddingLeft: 20 }}>{text}</span>,
    },
    { title: "총 인원", dataIndex: "employeeCount", key: "employeeCount", align: "center", render: (count) => `${count || 0}명` },
    {
      title: "휴직/휴가", key: "breakCount", align: "center",
      // ✅ 계산된 통계(departmentStats)를 사용해 휴직 인원 표시
      render: (_, record) => {
        const count = departmentStats[record.deptId]?.breakCount || 0;
        return <span>{count}명</span>;
      },
    },
    {
      title: "평균 나이", dataIndex: "avgAge", key: "avgAge", align: "center",
      render: (value, record) => record.deptCode % 10 === 0 ? "-" : (value ? `${value.toFixed(1)} 세` : "-"),
    },
    {
      title: "평균 근속연수", dataIndex: "avgYears", key: "avgYears", align: "center",
      render: (value, record) => record.deptCode % 10 === 0 ? "-" : (value ? `${value.toFixed(1)} 년` : "-"),
    },
  ];

  return (
    <>
      {/* ✅ EmployeeProvider를 통해 눈에 보이지 않게 직원 데이터 수신 */}
      <EmployeeProvider onDataReady={handleEmployeesReady} />

      {/* OverviewStats는 departmentStats를 prop으로 넘겨주도록 수정할 수 있습니다. */}
      <OverviewStats departments={departments} statusMap={departmentStats} employees={employees}/>

      <Card title="부서 현황 조회" bordered={false} style={{ margin: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Table
          columns={columns}
          dataSource={treeData}
          pagination={false}
          rowKey="deptId"
          expandable={{ defaultExpandAllRows: true }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: record.deptCode % 10 !== 0 ? "pointer" : "default" },
          })}
        />
      </Card>
    </>
  );
};

export default DepartmentOverviewPage;