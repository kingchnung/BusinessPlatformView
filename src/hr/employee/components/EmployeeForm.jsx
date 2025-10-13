import React, { useEffect } from "react";
import { Form, Input, Button, Card, Select, DatePicker, message, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addEmployee, editEmployee, getEmployeeDetail } from "@/slice/hrSlice";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

/**
 * ==============================
 * ✅ 직원 등록/수정 폼 컴포넌트
 * mode: "create" | "edit"
 * ==============================
 */
const EmployeeForm = ({ mode = "create" }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { empId } = useParams();
  const { selectedEmployee, loading } = useSelector((state) => state.hr);

  // 수정 모드일 때 상세 정보 불러오기
  useEffect(() => {
    if (mode === "edit" && empId) {
      dispatch(getEmployeeDetail(empId));
    }
  }, [mode, empId, dispatch]);

  // 불러온 직원 정보를 폼에 세팅
  useEffect(() => {
    if (mode === "edit" && selectedEmployee) {
      form.setFieldsValue({
        empName: selectedEmployee.empName,
        departmentName: selectedEmployee.departmentName,
        rankName: selectedEmployee.rankName,
        positionName: selectedEmployee.positionName,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        hireDate: selectedEmployee.hireDate
          ? dayjs(selectedEmployee.hireDate)
          : null,
        status: selectedEmployee.status || "ACTIVE",
      });
    }
  }, [selectedEmployee, mode, form]);

  const handleSubmit = async (values) => {
    try {
      if (mode === "create") {
        await dispatch(addEmployee(values));
        message.success("신규 직원 등록 완료 ✅");
      } else {
        await dispatch(editEmployee({ empId, employeeData: values }));
        message.success("직원 정보 수정 완료 ✏️");
      }
      navigate("/hr");
    } catch (error) {
      console.error("폼 처리 오류:", error);
      message.error("요청 처리 중 문제가 발생했습니다.");
    }
  };

  return (
    <Card
      title={mode === "create" ? "신규 직원 등록" : "직원 정보 수정"}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="이름"
          name="empName"
          rules={[{ required: true, message: "직원 이름을 입력하세요." }]}
        >
          <Input placeholder="직원 이름" />
        </Form.Item>

        <Form.Item
          label="부서"
          name="departmentName"
          rules={[{ required: true, message: "부서를 입력하세요." }]}
        >
          <Input placeholder="부서명" />
        </Form.Item>

        <Form.Item label="직급" name="rankName">
          <Input placeholder="직급" />
        </Form.Item>

        <Form.Item label="직책" name="positionName">
          <Input placeholder="직책" />
        </Form.Item>

        <Form.Item
          label="이메일"
          name="email"
          rules={[{ type: "email", message: "올바른 이메일 주소를 입력하세요." }]}
        >
          <Input placeholder="example@company.com" />
        </Form.Item>

        <Form.Item label="전화번호" name="phone">
          <Input placeholder="010-1234-5678" />
        </Form.Item>

        <Form.Item label="입사일" name="hireDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="상태" name="status" initialValue="ACTIVE">
          <Select
            options={[
              { label: "재직", value: "ACTIVE" },
              { label: "휴직", value: "LEAVE" },
              { label: "퇴사", value: "RESIGNED" },
            ]}
          />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: "#1677ff",
              borderRadius: 6,
            }}
          >
            {mode === "create" ? "등록" : "수정"}
          </Button>
          <Button onClick={() => navigate("/hr")}>취소</Button>
        </Space>
      </Form>
    </Card>
  );
};

export default EmployeeForm;
