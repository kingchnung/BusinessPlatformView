import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, message, Spin, Row, Col } from "antd";
import dayjs from "dayjs";
import { updateEmployee } from "../../../api/hr/employeeApi";
import axiosInstance from "../../../common/axiosInstance";

const { Option } = Select;

const EmployeeEditForm = ({ empId, userRoles }) => {
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = userRoles.includes("ROLE_MANAGER") || userRoles.includes("ROLE_CEO");

  // ✅ 초기 데이터 불러오기
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axiosInstance.get(`/employees/${empId}`);
        setEmployee(res.data);
        form.setFieldsValue({
          ...res.data,
          startDate: res.data.startDate ? dayjs(res.data.startDate) : null,
          leaveDate: res.data.leaveDate ? dayjs(res.data.leaveDate) : null,
        });
      } catch (err) {
        message.error("직원 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [empId, form]);

  // ✅ 제출
  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : null,
        leaveDate: values.leaveDate ? dayjs(values.leaveDate).format("YYYY-MM-DD") : null,
      };
      await updateEmployee(empId, payload);
      message.success("인사카드가 수정되었습니다.");
    } catch (err) {
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return <Spin tip="직원 정보 불러오는 중..." />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="전화번호" name="phone">
            <Input placeholder="010-1234-5678" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="이메일" name="email">
            <Input disabled placeholder="사번 기반 자동생성" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="주소" name="address">
        <Input.TextArea rows={2} placeholder="서울시 ..." />
      </Form.Item>

      {/* 관리자 전용 필드 */}
      {isAdmin && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="입사일" name="startDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="퇴사일" name="leaveDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="상태" name="status">
                <Select>
                  <Option value="ACTIVE">재직</Option>
                  <Option value="INACTIVE">퇴사</Option>
                  <Option value="ON_LEAVE">휴직</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="근속연수" name="careerYears">
                <Input type="number" min={0} step={0.1} placeholder="예: 3.5" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Button type="primary" htmlType="submit">
          수정하기
        </Button>
      </div>
    </Form>
  );
};

export default EmployeeEditForm;
