import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Spin,
  Modal,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { updateEmployee } from "../../../api/hr/employeeApi";
import axiosInstance from "../../../common/axiosInstance";

const { Option } = Select;

const EmployeeEditFormPage = () => {
  const [form] = Form.useForm();
  const { empId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // ✅ 퇴직 처리 함수
  const handleRetire = async () => {
    try {
      await axiosInstance.put(`/employees/${empId}/retire`);
      message.success("퇴직 처리되었습니다.");

      // ✅ 폼 즉시 반영
      form.setFieldsValue({
      status: "RETIRED",
      leaveDate: dayjs().format("YYYY-MM-DD"),
    });

      navigate("/hr/employee/cards");
    } catch (err) {
      console.error(err);
      message.error("퇴직 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axiosInstance.get(`/employees/${empId}`);
        const data = res.data || {};

        // ✅ 성별 변환
        const genderLabel =
          data.gender === "F" ? "여성" : data.gender === "M" ? "남성" : "";

        // ✅ 나이 계산
        const birth = data.birthDate ? dayjs(data.birthDate) : null;
        const age = birth ? dayjs().diff(birth, "year") : null;

        // ✅ 근속연수 계산
        const start = data.startDate ? dayjs(data.startDate) : null;
        const yearsOfService = start ? dayjs().diff(start, "year") : null;

        setEmployee(data);
        form.setFieldsValue({
          empNo: data.empNo,
          empName: data.empName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          gender: genderLabel,
          startDate: data.startDate ? dayjs(data.startDate) : null,
          leaveDate: data.leaveDate ? dayjs(data.leaveDate) : null,
          birthDate: data.birthDate ? dayjs(data.birthDate) : null,
          age: age,
          status: data.status,
          careerYears: yearsOfService,
        });
      } catch (err) {
        console.error(err);
        message.error("직원 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [empId, form]);

  // ✅ 수정 요청
  const onFinish = async (values) => {
    try {
      const payload = {
        phone: values.phone,
        email: values.email,
        address: values.address,
        gender:
          values.gender === "여성"
            ? "F"
            : values.gender === "남성"
            ? "M"
            : null,
        startDate: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : null,
        leaveDate: values.leaveDate
          ? dayjs(values.leaveDate).format("YYYY-MM-DD")
          : null,
        birthDate: values.birthDate
          ? dayjs(values.birthDate).format("YYYY-MM-DD")
          : null,
        status: values.status,
        careerYears: Number(values.careerYears),
      };

      await updateEmployee(empId, payload);
      message.success("인사카드가 수정되었습니다.");
      navigate("/hr/employee/cards");
    } catch (err) {
      console.error(err);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <Spin tip="직원 정보 불러오는 중..." />;

  // ✅ 퇴직자 상태면 모든 필드 비활성화
  const isRetired = employee?.status === "RETIRED";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>인사카드 수정</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isRetired} // ✅ 퇴직자는 폼 전체 비활성화
      >
        {/* ✅ 1행 : 사번 / 이름 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Form.Item label="사번" name="empNo" style={{ flex: 1 }}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="이름" name="empName" style={{ flex: 1 }}>
            <Input disabled />
          </Form.Item>
        </div>

        {/* ✅ 2행 : 나이 / 성별 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Form.Item label="나이" name="age" style={{ flex: 1 }}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="성별" name="gender" style={{ flex: 1 }}>
            <Input disabled />
          </Form.Item>
        </div>

        {/* ✅ 3행 : 전화번호 / 이메일 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Form.Item label="전화번호" name="phone" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item label="이메일" name="email" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        {/* ✅ 4행 : 주소 */}
        <Form.Item label="주소" name="address">
          <Input.TextArea rows={2} />
        </Form.Item>

        {/* ✅ 5행 : 입사일 / 퇴사일 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Form.Item label="입사일" name="startDate" style={{ flex: 1 }}>
            <DatePicker style={{ width: "100%" }} disabled />
          </Form.Item>
          <Form.Item label="퇴사일" name="leaveDate" style={{ flex: 1 }}>
            <DatePicker style={{ width: "100%" }} disabled />
          </Form.Item>
        </div>

        {/* ✅ 6행 : 상태 / 근속연수 */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Form.Item label="상태" name="status" style={{ flex: 1 }}>
            <Select disabled={isRetired}>
              <Option value="ACTIVE">재직</Option>
              <Option value="BREAK">휴직</Option>
            </Select>
          </Form.Item>
          <Form.Item label="근속연수" name="careerYears" style={{ flex: 1 }}>
            <Input type="number" min={0} step={0.1} disabled />
          </Form.Item>
        </div>

        {/* ✅ 버튼 영역 */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
            취소
          </Button>
          <Button
            onClick={() => navigate("/hr/employee/cards")}
            style={{ marginRight: 8 }}
          >
            목록
          </Button>
          {!isRetired && (
            <>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                수정하기
              </Button>
              <Button danger onClick={() => setIsModalVisible(true)}>
                퇴직처리
              </Button>
            </>
          )}
        </div>
      </Form>

      {/* ✅ 퇴직 확인 모달 */}
      <Modal
        title="퇴직 처리 확인"
        open={isModalVisible}
        onOk={handleRetire}
        onCancel={() => setIsModalVisible(false)}
        okText="퇴직처리"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <p>현시점으로 퇴직 처리하시겠습니까?</p>
        <p style={{ color: "gray" }}>
          처리 후에는 상태가 '퇴직'으로 변경되며, 복귀 시 별도 수정이 필요합니다.
        </p>
      </Modal>
    </div>
  );
};

export default EmployeeEditFormPage;
