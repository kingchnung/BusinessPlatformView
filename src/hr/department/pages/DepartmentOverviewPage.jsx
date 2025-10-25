import React, { useEffect, useState, useMemo, useCallback } from "react"; // ✅ useMemo 추가
import { Table, Card, Spin, message, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../common/axiosInstance";
import { divideDepartmentsByCode, getTeamsByDivisionCode } from "../../util/departmentDivision";
import OverviewStats from "../components/OverviewStats";
import EmployeeProvider from "../../employee/components/EmployeeProvider"; // ✅ EmployeeProvider import

/**
 * 📄 DepartmentOverviewPage.jsx
 * EmployeeProvider를 통해 전체 직원 데이터를 받아 부서별 통계를 직접 계산하는 페이지
 */

const TEAM_CAPACITY = 5;

const DepartmentOverviewPage = () => {
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [employees, setEmployees] = useState([]);     // ✅ 전체 직원 목록을 저장할 state
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ EmployeeProvider가 데이터를 전달하면 employees state에 저장
  const handleEmployeesReady = useCallback((allEmployees) => {
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

  // ✅ 1. 모든 통계 데이터를 여기서 한 번에 계산 (useMemo 활용)
  const departmentStats = useMemo(() => {
    // 직원들을 부서 ID별로 그룹화하여 빠르게 찾을 수 있도록 Map 생성
    const employeesByDept = new Map();
    employees.forEach(emp => {
      if (!employeesByDept.has(emp.deptId)) {
        employeesByDept.set(emp.deptId, []);
      }
      employeesByDept.get(emp.deptId).push(emp);
    });

    const statsMap = {};
    departments.forEach(dept => {
      const deptEmps = employeesByDept.get(dept.deptId) || [];
      
      // ✅ 퇴직자 제외 (null 방지)
    const activeEmps = deptEmps.filter(e => (e.status || '').toUpperCase() !== 'RETIRED');

    // ✅ 휴직자 수
    const onBreak = activeEmps.filter(e => (e.status || '').toUpperCase() === 'BREAK').length;

    // ✅ 퇴직자 수
    const retired = deptEmps.filter(e => (e.status || '').toUpperCase() === 'RETIRED').length;

    // ✅ 현재 근무자 = 재직자 중 휴직자 제외
    const currentStaff = activeEmps.filter(e => (e.status || '').toUpperCase() === 'ACTIVE').length;
    
    const activeCountWithBreak = activeEmps.length;
    // ✅ 팀장 찾기 (positionCode === 14)
    const teamLead = activeEmps.find(e => e.positionCode === 2);

      statsMap[dept.deptId] = {
        currentStaff,
        breakCount: onBreak,
        retiredCount: retired,
        activeCountWithBreak,
        teamLeadName: teamLead ? teamLead.empName : '-',
      
      };
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
    { title: "부서명", dataIndex: "deptName", key: "deptName",
      render: (text, record) => record.deptCode % 10 === 0 ? <strong>{text}</strong> : <span style={{ paddingLeft: 20 }}>{text}</span>,
    },
    { title: "현재 인원", key: "currentStaff", align: "center",
      render: (_, record) => {
        if (record.deptCode % 10 === 0) return '-';
        const stats = departmentStats[record.deptId];
        return stats ? `${stats.currentStaff}명` : '0명';
      }
    },
    { title: "총 인원", dataIndex: "employeeCount", key: "employeeCount", align: "center",
      render: (count) => `${count || 0}명`,
    },
    { title: "(휴가/퇴직)", key: "status", align: "center",
      render: (_, record) => {
        if (record.deptCode % 10 === 0) return '-';
        const stats = departmentStats[record.deptId];
        return stats ? `${stats.breakCount} / ${stats.retiredCount}` : '0 / 0';
      }
    },
    { title: "팀장", key: "teamLead", align: "center",
      render: (_, record) => {
        if (record.deptCode % 10 === 0) return '-';
        const stats = departmentStats[record.deptId];
        return stats ? stats.teamLeadName : '-';
      }
    },
    { title: "정원 대비", key: "capacity", width: 150,
      render: (_, record) => {
        if (record.deptCode % 10 === 0 ) return '-';
        const stats = departmentStats[record.deptId];
        const activeCountWithBreak = stats ? stats.activeCountWithBreak : 0;

        const percent = (activeCountWithBreak / TEAM_CAPACITY) * 100;
        return (
          <div style={{ textAlign: 'center' }}>
            <span>{`${activeCountWithBreak} / ${TEAM_CAPACITY}명`}</span>
            <Progress percent={percent} showInfo={false} size="small" />
          </div>
        );
      }
    },
    { title: "평균 근속", key: "avgYears", align: "center",
      render: (_, record) => {
        if (record.deptCode % 10 === 0) return '-';
        return record.avgYears ? `${record.avgYears.toFixed(1)}년` : '-';
      }
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