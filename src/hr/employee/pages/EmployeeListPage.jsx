import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainPage from "./MainPage";
import { getEmployees } from "../slice/hrSlice";
import { Button, Spin, message } from "antd";
import EmployeeList from "../components/EmployeeList";
import { useNavigate } from "react-router-dom";

/**
 * ==============================
 * ✅ 직원 목록 페이지
 * - Redux에서 직원 데이터 불러오기
 * - EmployeeList 컴포넌트 표시
 * ==============================
 */
const EmployeeListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, error } = useSelector((state) => state.hr);

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error("직원 목록을 불러오는 중 오류가 발생했습니다.");
  }, [error]);

  const handleAdd = () => {
    navigate("/hr/add");
  };

  return (
    <MainPage>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>직원 관리</h2>
        <Button
          type="primary"
          onClick={handleAdd}
          style={{
            backgroundColor: "#1677ff",
            borderRadius: 6,
          }}
        >
          + 신규 직원 등록
        </Button>
      </div>

      <hr style={{ marginBottom: 20 }} />

      <Spin spinning={loading} tip="직원 목록 로딩 중...">
        <EmployeeList data={employees} />
      </Spin>
    </MainPage>
  );
};

export default EmployeeListPage;
