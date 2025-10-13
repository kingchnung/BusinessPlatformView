import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Row, Col, DatePicker, message, Spin } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../common/axiosInstance";
import { fetchPositions } from "../../../api/hr/positionAPI";
import { fetchGrades } from "../../../api/hr/gradeAPI";

const { Option } = Select;

const EmployeeCardForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [grades, setGrades] = useState([]); // 🔹 추가
  const [selectedDept, setSelectedDept] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /** ✅ 초기 데이터 로드 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ 부서 목록
        const deptRes = await axiosInstance.get("/departments");
        const allDepartments = deptRes.data;
        const mainDepts = allDepartments.filter((d) => !d.parentDeptId);
        setDepartments(mainDepts);

        // ✅ 직급 목록 (CEO 제외)
        const positionData = await fetchPositions();
        setPositions(positionData.filter((p) => p.positionName !== "CEO"));

        // ✅ 직위(Grade) 목록
        const gradeData = await fetchGrades();
        setGrades(gradeData.filter((g) => g.gradeName !== "임원"));

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        message.error("기초 데이터를 불러오지 못했습니다.");
      }
    };
    fetchData();
  }, []);

  /** ✅ 부서 선택 시 팀 목록 필터링 */
  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    axiosInstance.get("/departments").then((res) => {
      const filtered = res.data.filter((d) => d.parentDeptId === deptId);
      setTeams(filtered);
      form.setFieldsValue({ teamId: null });
    });
  };

  /** ✅ 제출 */
  const handleFinish = (values) => {
    // ⚙️ 부서 코드 가져오기
    const selectedDeptObj = departments.find((d) => d.deptId === values.deptId);
    const selectedTeamObj = teams.find((t) => t.deptId === values.teamId);
    const deptCode = selectedTeamObj
      ? selectedTeamObj.deptCode
      : selectedDeptObj?.deptCode;

    const email = `${values.empName}.${dayjs().format("YYMMDD")}@bizmate.com`;

    const payload = {
      empName: values.empName,
      gender: values.gender,
      birthDate: values.birthDate ? dayjs(values.birthDate).format("YYYY-MM-DD") : null,
      phone: values.phone,
      email,
      address: values.address,
      deptCode: deptCode, 
      positionCode: values.positionCode,
      gradeCode: values.gradeCode,
      startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : null,
    };

    console.log("📤 등록 요청 데이터:", payload);
    onSubmit(payload);
  };

  if (isLoading) {
    return (
        <div style={{ textAlign: "center", padding: "40px 0"}}>
            <Spin size="large" />
            <p style={{ marginTop: 8, color: "#888" }}>등록폼 초기화 중...</p>
        </div>
    );
  }
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 850, margin: "0 auto" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="이름"
            name="empName"
            rules={[{ required: true, message: "이름을 입력하세요." }]}
          >
            <Input placeholder="직원 이름" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="성별"
            name="gender"
            rules={[{ required: true, message: "성별을 선택하세요." }]}
          >
            <Select placeholder="성별 선택">
              <Option value="M">남성</Option>
              <Option value="F">여성</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="생년월일"
            name="birthDate"
            rules={[{ required: true, message: "생년월일을 입력하세요." }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="전화번호" name="phone">
            <Input placeholder="010-1234-5678" />
          </Form.Item>
        </Col>
      </Row>

      {/* ✅ 부서 / 팀 선택 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="부서"
            name="deptId"
            rules={[{ required: true, message: "부서를 선택하세요." }]}
          >
            <Select
              placeholder="부서를 선택하세요"
              onChange={handleDeptChange}
              allowClear
            >
              {departments.map((d) => (
                <Option key={d.deptId} value={d.deptId}>
                  {d.deptName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="팀" name="teamId">
            <Select
              placeholder="팀을 선택하세요"
              disabled={!selectedDept}
              allowClear
            >
              {teams.map((t) => (
                <Option key={t.deptId} value={t.deptId}>
                  {t.deptName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* ✅ 직급 / 직위 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="직급"
            name="positionCode"
            rules={[{ required: true, message: "직급을 선택하세요." }]}
          >
            <Select placeholder="직급 선택">
              {positions.map((p) => (
                <Option key={p.positionCode} value={p.positionCode}>
                  {p.positionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="직위"
            name="gradeCode"
            rules={[{ required: true, message: "직위를 선택하세요." }]}
          >
            <Select placeholder="직위 선택">
              {grades.map((g) => (
                <Option key={g.gradeCode} value={g.gradeCode}>
                  {g.gradeName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="주소" name="address">
        <Input.TextArea rows={2} placeholder="서울시 강남구 ..." />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="입사일"
            name="startDate"
            rules={[{ required: true, message: "입사일을 선택하세요." }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: 220 }}
        >
          등록하기
        </Button>
      </div>
    </Form>
  );
};

export default EmployeeCardForm;
