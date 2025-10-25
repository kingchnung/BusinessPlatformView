import React, { useState, useEffect } from "react";
import {  Modal,  Form,  Input,  Select,  DatePicker,  InputNumber,  Radio,  message, Typography,} from "antd";
import dayjs from "dayjs";
 
import { createProject } from "../../../api/work/projectApi";
import axiosInstance from "../../../common/axiosInstance";
import { divideDepartmentsByCode } from "../../../hr/util/departmentDivision";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const ProjectCreateModal = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [pmId, setPmId] = useState(null);
  const [pmName, setPmName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [budgetText, setBudgetText] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ 부서 및 직원 데이터 로드
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [deptRes, empRes] = await Promise.all([
            axiosInstance.get("/departments"),
            axiosInstance.get("/employees"),
          ]);
          const {teams} = divideDepartmentsByCode(deptRes.data || []);
          setDepartments(teams);
          setEmployees(empRes.data || []);
        } catch (err) {
          console.error("데이터 로드 실패:", err);
          message.error("데이터 로드 중 오류가 발생했습니다.");
        }
      };
      fetchData();
    }, []);

  // ✅ 부서 선택 시 PM 자동 지정
  useEffect(() => {
    if (!selectedDept) return;
    const dept = departments.find((d) => d.deptId === selectedDept);
    if (!dept) return;

    const manager = employees.find((e) => e.empId === dept.managerId);
    if (manager) {
      setPmId(manager.empId);
      setPmName(manager.empName);
    } else {
      setPmId(null);
      setPmName("");
    }
  }, [selectedDept, departments, employees]);

    // ✅ 예산 → 한글 표기 변환
  const numberToKorean = (number) => {
    if (!number) return "";
    const units = ["", "만", "억", "조"];
    let result = "";
    let i = 0;
    while (number > 0) {
      const part = number % 10000;
      if (part > 0) result = part + units[i] + " " + result;
      number = Math.floor(number / 10000);
      i++;
    }
    return result.trim() + " 원";
  };

    // ✅ 라디오 버튼 클릭 시 기간 자동 설정
    const handleQuickPeriod = (months) => {
      const start = dayjs();
      const end = start.add(months, "month");
      form.setFieldsValue({ period: [start, end] });
      setSelectedPeriod(months);
    };



  const handleSubmit = async (values) => {
    if(!userInfo?.userId){
        message.error("작성자 정보가 없습니다. 다시 로그인해주세요.");
        return;
    }

    const [startDate, endDate] = values.period || [];
    const payload = {
      projectName: values.projectName,
      projectGoal: values.projectGoal,
      projectOverview: values.projectOverview,
      expectedEffect: values.expectedEffect,
      totalBudget: values.totalBudget,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      departmentId: values.departmentId,
      pmId: pmId, // ✅ 자동 또는 수동 지정된 PM
      authorId:userInfo?.userId,
    };

    try {
      setLoading(true);
      await createProject(payload);
      message.success("프로젝트가 생성되었습니다!");
      onClose();
    } catch (err) {
      console.error("프로젝트 생성 실패:", err);
      message.error("프로젝트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
    const handleBudgetChange = (value) => {
    setBudgetText(numberToKorean(value));
  };

  return (
    <Modal
  title="📁 프로젝트 생성"
  open={open}
  onCancel={onClose}
  onOk={() => form.submit()}
  okText="생성"
  confirmLoading={loading}
  width={800}
  destroyOnClose
>
  <Form
    layout="vertical"
    form={form}
    onFinish={handleSubmit}
    initialValues={{ totalBudget: 0 }}
  >
    {/* ✅ 프로젝트명 */}
    <Form.Item
      label="프로젝트명"
      name="projectName"
      rules={[{ required: true, message: "프로젝트명을 입력하세요." }]}
    >
      <Input placeholder="예: 업무 자동화 시스템 구축" />
    </Form.Item>

    {/* ✅ 담당 부서 (팀만 표시) */}
    <Form.Item
      label="담당 부서"
      name="departmentId"
      rules={[{ required: true, message: "담당 부서를 선택하세요." }]}
    >
      <Select
        placeholder="담당 부서를 선택하세요"
        onChange={(value) => setSelectedDept(value)}
      >
        {departments.map((dept) => (
          <Select.Option key={dept.deptId} value={dept.deptId}>
            {dept.deptName}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>

    {/* ✅ 프로젝트 매니저 (PM) — 자동 지정 + 수동 변경 가능 */}
    <Form.Item label="프로젝트 매니저 (PM)">
      <Select
        value={pmId || undefined}
        placeholder="PM을 선택하세요"
        onChange={(val) => setPmId(val)}
        disabled={!selectedDept} // 부서 선택 전에는 비활성화
      >
        {employees
          .filter((e) => e.deptId === selectedDept)
          .map((emp) => (
            <Select.Option key={emp.empId} value={emp.empId}>
              {emp.empName} ({emp.positionName})
            </Select.Option>
          ))}
      </Select>
      {pmName && (
        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
          자동 지정된 부서장: {pmName}
        </Text>
      )}
    </Form.Item>

    {/* ✅ 프로젝트 기간 + 빠른 선택 */}
    <Form.Item
      label="프로젝트 기간"
      name="period"
      rules={[{ required: true, message: "프로젝트 기간을 설정하세요." }]}
    >
      <RangePicker
        format="YYYY-MM-DD"
        style={{ width: "100%" }}
        disabledDate={(date) => date.isBefore(dayjs(), "day")}
      />
    </Form.Item>
    <Radio.Group
      onChange={(e) => handleQuickPeriod(e.target.value)}
      value={selectedPeriod}
      style={{ marginBottom: 16 }}
    >
      <Radio.Button value={3}>3개월</Radio.Button>
      <Radio.Button value={6}>6개월</Radio.Button>
      <Radio.Button value={12}>1년</Radio.Button>
    </Radio.Group>

    {/* ✅ 총 예산 입력 */}
    <Form.Item label="총 예산" name="totalBudget">
      <InputNumber
        style={{ width: "100%" }}
        min={0}
        step={10000}
        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={(v) => v.replace(/,/g, "")}
        onChange={handleBudgetChange}
        placeholder="₩ 예산을 입력하세요"
      />
    </Form.Item>
    {budgetText && (
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        {budgetText}
      </Text>
    )}

    {/* ✅ 프로젝트 목표 */}
    <Form.Item label="프로젝트 목표" name="projectGoal">
      <Input.TextArea rows={2} placeholder="프로젝트의 주요 목표를 작성하세요." />
    </Form.Item>

    {/* ✅ 프로젝트 개요 */}
    <Form.Item label="프로젝트 개요" name="projectOverview">
      <Input.TextArea rows={3} placeholder="프로젝트의 주요 내용을 요약하세요." />
    </Form.Item>

    {/* ✅ 기대 효과 */}
    <Form.Item label="기대 효과" name="expectedEffect">
      <Input.TextArea rows={2} placeholder="예상되는 효과를 작성하세요." />
    </Form.Item>
  </Form>
</Modal>
  );
};

export default ProjectCreateModal;
