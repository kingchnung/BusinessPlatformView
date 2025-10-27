import React, { useEffect, useState } from "react";
import { Row, Col, Pagination, Spin, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getEmployees } from "../slice/hrSlice";
import EmployeeCardItem from "../components/EmployeeCarditem";
import OverviewStats from "../../department/components/OverviewStatsMini";
import SearchInput from "../../hrcommon/SearchInput";
import { useSearch } from "../../hooks/useSearch";

const EmployeeCardListPage = () => {
  const dispatch = useDispatch();
  const { employees = [], loading } = useSelector((state) => state.hr || {});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  const employeeList = Array.isArray(employees)
    ? employees
    : employees?.dtoList || [];

  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredEmployees,
  } = useSearch(employeeList, ["empName", "deptName", "positionName", "gradeName"]);
  

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredEmployees?.slice(startIndex, startIndex + pageSize) || [];

  return (
    
    <Spin spinning={loading}>
      

      {/* ✅ 검색창 */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-start" }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="이름 / 부서 / 직위 / 직급 검색"
            allowClear
          />
        </div>

        <div style={{margin:20}}>
        <OverviewStats employees={employeeList} />
      </div>
    
      <Card
        title="인사카드 조회"
        style={{
          margin: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        {/* 카드 그리드 */}
        <Row gutter={[24, 24]} justify="start">
          {currentData && currentData.length > 0 ?(
          currentData.map((emp) => 
            emp ? (
            <Col key={emp.empId} xs={24} sm={12} md={6} lg={6}>
              <EmployeeCardItem emp={emp} />
            </Col>
          ) : null
        )
        ): (
          <div style={{textAlign: "center", width: "100%", marginTop: 20}}>
            직원정보가 없습니다.
          </div>
        )}
        </Row>

        {/* 페이징 */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={employees.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>
    </Spin>
  );
};

export default EmployeeCardListPage;
