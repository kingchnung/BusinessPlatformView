import React, { useEffect, useState } from "react";
import {
  Form, Input, Select, Button, Row, Col, DatePicker, message, Spin
} from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../common/axiosInstance";
import { fetchPositions } from "../../../api/hr/positionAPI";
import { fetchGrades } from "../../../api/hr/gradeAPI";

const { Option } = Select;

const EmployeeCardForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptRes = await axiosInstance.get("/departments");
        const data = deptRes.data;
        setAllDepartments(data);

        const teamOnly = data.filter((dept)=>{
          const lastDigit = parseInt(dept.deptCode.slice(-1));
          return lastDigit !== 0;
        });
        setTeams(teamOnly); // 팀만 저장
        setDepartments(data.filter((d) => !d.parentDeptId)); // 상위부서만 저장

        const positionData = await fetchPositions();
        setPositions(positionData);

        const gradeData = await fetchGrades();
        setGrades(gradeData);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        message.error("기초 데이터를 불러오지 못했습니다.");
      }
    };
    fetchData();
  }, []);

  /** ✅ 팀 선택 시 부서 자동 지정 + 사번 자동 생성 */
  const handleTeamChange = async (teamId) => {
    const selectedTeam = teams.find((d) => d.deptId === teamId);
    if (!selectedTeam) return;
    const upperDeptCode = `${Math.floor(parseInt(selectedTeam.deptCode)/10)*10}`;
    const parentDept = allDepartments.find(
      (d) => d.deptCode === upperDeptCode);
    
    // 🔹 부서 자동 선택
    if (parentDept) {
      form.setFieldsValue({ deptId: parentDept.deptId });
    };

    // 🔹 사번 자동 생성 (예: 회사코드 50 + 부서코드 + 001)
    try{
    const res = await axiosInstance.get(`/employees/next-no/${selectedTeam.deptCode}`);
    const empNo = res.data.EmpNo;
    form.setFieldsValue({ 
      empNo ,
      email: `${empNo}@bizmate.com`,
    });
  } catch (err){
    console.error(err);
    message.error("사번생성실패")
  }
  };

    


  /** ✅ 직위 선택 시 직급 자동 지정 */
  const handleGradeChange = (gradeCode) => {
    const selectedGrade = grades.find((g) => g.gradeCode === gradeCode);
    if (!selectedGrade) return;

    let matchedPosition = null;
    if (
      selectedGrade.gradeName.includes("사원") ||
      selectedGrade.gradeName.includes("대리")
    ) {
      matchedPosition = positions.find((p) => p.positionName === "사원");
    } else if (
      selectedGrade.gradeName.includes("부장") ||
      selectedGrade.gradeName.includes("차장")
    ) {
      matchedPosition = positions.find((p) => p.positionName === "팀장");
    }

    if (matchedPosition) {
      form.setFieldsValue({ positionCode: matchedPosition.positionCode });
    }
  };
  const padZero =(num)=>String(num).padStart(2, '0');

  /** ✅ 제출 */
  const handleFinish = (values) => {
    const selectedTeam = allDepartments.find((t) => t.deptId === values.teamId);
    const deptCode = selectedTeam ? selectedTeam.deptCode : null;
    const birthDateValue = `${values.birthYear}-${padZero(values.birthMonth)}-${padZero(values.birthDay)}`;
    const email = `${values.empNo}@bizmate.com`;

    const payload = {
      empNo: values.empNo,
      empName: values.empName,
      gender: values.gender,
      birthDate: birthDateValue,
      phone: values.phone,
      email,
      address: values.address,
      deptCode,
      positionCode: values.positionCode,
      gradeCode: values.gradeCode,
      startDate: values.startDate
        ? dayjs(values.startDate).format("YYYY-MM-DD")
        : null,
    };

    console.log("📤 등록 요청:", payload);
    onSubmit(payload);
  };
  

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
        <p>등록폼 초기화 중...</p>
      </div>
    );

  // 연/월/일 select
  const years = Array.from({ length: 60 }, (_, i) => dayjs().year() - i - 18);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 850, margin: "0 auto" }}
    >
      {/* 사번 / 이름 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="사번" name="empNo">
            <Input readOnly placeholder="자동 생성" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="이름"
            name="empName"
            rules={[{ required: true, message: "이름을 입력하세요." }]}
          >
            <Input placeholder="직원 이름" />
          </Form.Item>
        </Col>
      </Row>

      {/* 성별 / 생년월일 */}
      <Row gutter={16}>
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
        <Col span={12}>
          <Form.Item label="생년월일" required>
            <Input.Group compact>
              <Form.Item name="birthYear" noStyle>
                <Select placeholder="연도" style={{ width: "33%" }}>
                  {years.map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="birthMonth" noStyle>
                <Select placeholder="월" style={{ width: "33%" }}>
                  {months.map((m) => (
                    <Option key={m} value={m}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="birthDay" noStyle>
                <Select placeholder="일" style={{ width: "34%" }}>
                  {days.map((d) => (
                    <Option key={d} value={d}>
                      {d}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
      </Row>

      {/* 팀 / 부서 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="팀"
            name="teamId"
            rules={[{ required: true, message: "팀을 선택하세요." }]}
          >
            <Select placeholder="팀 선택" onChange={handleTeamChange}>
              {teams.map((t) => (
                <Option key={t.deptId} value={t.deptId}>
                  {t.deptName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="부서" name="deptId">
            <Select placeholder="팀 선택 시 자동 설정" disabled>
              {departments.map((d) => (
                <Option key={d.deptId} value={d.deptId}>
                  {d.deptName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 직위 / 직급 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="직위"
            name="gradeCode"
            rules={[{ required: true, message: "직위를 선택하세요." }]}
          >
            <Select placeholder="직위 선택" onChange={handleGradeChange}>
              {grades.map((g) => (
                <Option key={g.gradeCode} value={g.gradeCode}>
                  {g.gradeName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="직급" name="positionCode">
            <Select placeholder="직위 선택 시 자동 설정" disabled>
              {positions.map((p) => (
                <Option key={p.positionCode} value={p.positionCode}>
                  {p.positionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 이메일 / 전화번호 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="이메일" name="email">
            <Input placeholder="자동 생성" readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
          label="전화번호" 
          name="phone"
          rules={[{ required: true, message: "전화번호는 필수항목입니다." }]}>
            <Input placeholder="010-1234-5678" />
          </Form.Item>
        </Col>
      </Row>

      {/* 주소 */}
      <Form.Item label="주소" name="address">
        <Input.TextArea rows={2} placeholder="서울시 강남구 ..." />
      </Form.Item>

      {/* 입사일 */}
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
