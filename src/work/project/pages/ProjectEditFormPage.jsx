import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Radio,
  message,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { fetchProjectDetail, updateProject } from "../../../api/work/projectApi";
import { useDepartments } from "../../../hr/hooks/useDepartments";
import { useEmployees } from "../../../hr/hooks/useEmployees";
import { divideDepartmentsByCode } from "../../../hr/util/departmentDivision";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const ProjectEditPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [pmId, setPmId] = useState(null);
  const [pmName, setPmName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const { departments } = useDepartments();
  const { employees } = useEmployees();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProjectDetail(projectId);
        if (!data) throw new Error("데이터 없음");

        // ✅ 초기값 설정
        form.setFieldsValue({
          projectName: data.projectName,
          departmentId: data.department?.deptId,
          period: [dayjs(data.startDate), dayjs(data.endDate)],
          totalBudget: data.totalBudget,
          projectGoal: data.projectGoal,
          projectOverview: data.projectOverview,
          expectedEffect: data.expectedEffect,
        });

        setSelectedDept(data.department?.deptId);
        setPmId(data.pmId);
        setPmName(data.pmName);
      } catch (error) {
        console.error(error);
        message.error("프로젝트 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, form]);

  // ✅ 부서 선택 시 PM 자동 지정
  useEffect(() => {
    if (!selectedDept || !employees.length) return;
    const dept = departments.find((d) => d.deptId === selectedDept);
    const manager = employees.find((e) => e.empId === dept?.managerId);
    if (manager) {
      setPmId(manager.empId);
      setPmName(manager.empName);
    }
  }, [selectedDept, employees, departments]);

  // ✅ 기간 빠른 선택
  const handleQuickPeriod = (months) => {
    const start = dayjs();
    const end = start.add(months, "month");
    form.setFieldsValue({ period: [start, end] });
    setSelectedPeriod(months);
  };

  // ✅ 수정 저장
  const handleSubmit = async (values) => {
    const [startDate, endDate] = values.period || [];
    const payload = {
      ...values,
      pmId,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
    };
    try {
      setLoading(true);
      await updateProject(projectId, payload);
      message.success("프로젝트가 수정되었습니다!");
      navigate(`/work/project/detail/${projectId}`);
    } catch (err) {
      console.error(err);
      message.error("프로젝트 수정 실패");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: "30vh" }} />;

  const { teams } = divideDepartmentsByCode(departments || []);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="📋 프로젝트 수정"
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="프로젝트명"
            name="projectName"
            rules={[{ required: true, message: "프로젝트명을 입력하세요." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="담당 부서"
            name="departmentId"
            rules={[{ required: true, message: "담당 부서를 선택하세요." }]}
          >
            <Select
              onChange={(v) => setSelectedDept(v)}
              placeholder="팀 선택"
              options={teams.map((d) => ({
                value: d.deptId,
                label: d.deptName,
              }))}
            />
          </Form.Item>

          <Form.Item label="프로젝트 매니저 (PM)">
            <Select
              value={pmId || undefined}
              placeholder="PM을 선택하세요"
              onChange={(val) => setPmId(val)}
              disabled={!selectedDept}
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

          <Form.Item
            label="프로젝트 기간"
            name="period"
            rules={[{ required: true, message: "프로젝트 기간을 설정하세요." }]}
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
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

          <Form.Item label="총 예산" name="totalBudget">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={10000}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/,/g, "")}
            />
          </Form.Item>

          <Form.Item label="프로젝트 목표" name="projectGoal">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item label="프로젝트 개요" name="projectOverview">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="예상 효과" name="expectedEffect">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button type="primary" htmlType="submit">
                저장
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectEditPage;