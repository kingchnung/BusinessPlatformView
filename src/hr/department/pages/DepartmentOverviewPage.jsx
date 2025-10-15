import React, { useEffect, useState } from "react";
import { Table, Card, Spin, message } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import { divideDepartmentsByCode, getTeamsByDivisionCode } from "../../util/departmentDivision";
import OverviewStats from "../components/OverviewStats";
import EmployeeCardItem from "../../employee/components/EmployeeCarditem";

/**
 * 📄 [DepartmentOverviewPage.jsx]
 * 부 ↔ 팀 계층 구조를 트리형으로 보여주는 페이지
 */
const DepartmentOverviewPage = () => {
  const [departments, setDepartments] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/departments/overview");
        const all = res.data;
        setDepartments(all);

        
        console.log("✅전체데이터 : ", all)
        const { divisions } = divideDepartmentsByCode(all);
        
        // ✅ 각 부 아래에 속한 팀(children)을 붙여 트리 구조 생성
        const structured = divisions.map((div) => {
          const children = getTeamsByDivisionCode(all, div.deptCode);
          return {
            key: div.deptId,
            ...div,
            children: children.map((team) => ({
              key: team.deptId,
              ...team,
            })),
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

  const handleRowClick = async (record) => {
    if (record.deptCode % 10 === 0) return; // 부서는 무시, 팀만 대상
    setSelectedTeam(record);
    try {
      const res = await axiosInstance.get(`/employees/byDepartment/${record.deptId}`);
      setTeamEmployees(res.data);
    } catch (err) {
      console.error(err);
      message.error("팀 인원 정보를 불러오지 못했습니다.");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin tip="부서 현황 불러오는 중..." />
      </div>
    );

  /** 📊 공통 컬럼 정의 */
  const columns = [
    {
      title: "부서명",
      dataIndex: "deptName",
      key: "deptName",
      render: (text, record) =>
        record.deptCode % 10 === 0 ? (
          <strong>{text}</strong>
        ) : (
          <span style={{ paddingLeft: 20 }}>{text}</span>
        ),
    },
    { title: "부서코드", dataIndex: "deptCode", key: "deptCode", align: "center" },
    { title: "인원 수", dataIndex: "employeeCount", key: "employeeCount", align: "center" },
    {
      title: "평균 나이",
      dataIndex: "avgAge",
      key: "avgAge",
      align: "center",
      render: (v) => (v ? `${v.toFixed(1)} 세` : "-"),
    },
    {
      title: "평균 근속연수",
      dataIndex: "avgYears",
      key: "avgYears",
      align: "center",
      render: (v) => (v ? `${v.toFixed(1)} 년` : "-"),
    },
  ];

  return (
    <>
        <OverviewStats departments={departments} />


    <Card
      title="부서 현황 조회"
      bordered={false}
      style={{
        margin: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Table
        columns={columns}
        dataSource={treeData}
        pagination={false}
        rowKey="deptId"
        expandable={{
          defaultExpandAllRows: true }}
        onRow={(record) => ({
            onClick: ()=> handleRowClick(record),
        })}         
      />
    </Card>
    {selectedTeam && (
        <Card
          title={`${selectedTeam.deptName} 인원 (${teamEmployees.length}명)`}
          style={{ margin: 20, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            {teamEmployees.length > 0 ? (
              teamEmployees.map((emp) => (
                <Col xs={24} sm={12} md={8} lg={6} key={emp.empId}>
                  <EmployeeCardItem employee={emp} />
                </Col>
              ))
            ) : (
              <p style={{ color: "#999" }}>등록된 직원이 없습니다.</p>
            )}
          </Row>
        </Card>
    )}
    </>
  );
};


export default DepartmentOverviewPage;
