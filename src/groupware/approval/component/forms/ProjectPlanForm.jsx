import React, { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Button,
  Select,
  Divider,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ProjectPlanForm = ({ value = {}, onChange, employeeOptions = [] }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  useFormInitializer(currentUser, value, onChange);

  const update = (key, val) => {
    const newValue = { ...value, [key]: val };
    onChange?.(newValue);
  };


  /** ✅ 프로젝트 기간 변경 핸들러 */
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      const duration = end.diff(start, "day") + 1;
      update("startDate", start.format("YYYY-MM-DD"));
      update("endDate", end.format("YYYY-MM-DD"));
      update("duration", duration);
    } else {
      update("startDate", null);
      update("endDate", null);
      update("duration", 0);
    }
  };

  // ✅ 예산항목 추가/삭제
  const handleBudgetChange = (index, field, val) => {
    const updated = [...(value.budgetItems || [])];
    updated[index][field] = val;
    update("budgetItems", updated);
  };

  const addBudgetItem = () => {
    update("budgetItems", [...(value.budgetItems || []), { itemName: "", amount: 0 }]);
  };

  const removeBudgetItem = (index) => {
    const updated = [...(value.budgetItems || [])];
    updated.splice(index, 1);
    update("budgetItems", updated);
  };

  // ✅ 총 예산 계산
  const totalBudget = useMemo(() => {
  const sum = (value.budgetItems || []).reduce(
    (sum, b) => sum + (Number(b.amount) || 0),
    0
  );
  update("totalBudget", sum); 
  return sum;
}, [value.budgetItems]);

  return (
    <>
      {/* 기본정보 */}
      <Form.Item label="작성자">
        <Input value={value.drafterName || ""} readOnly />
      </Form.Item>

      <Form.Item label="소속 부서">
        <Input value={value.drafterDept || ""} readOnly />
      </Form.Item>

      <Form.Item label="작성일">
        <Input
          value={
            value.createdDate
              ? dayjs(value.createdDate).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD")
          }
          readOnly
        />
      </Form.Item>

      <Divider />

      {/* 프로젝트명 */}
      <Form.Item label="프로젝트명" required>
        <Input
          placeholder="예: 신규 ERP 시스템 도입 프로젝트"
          value={value.projectName || ""}
          onChange={(e) => update("projectName", e.target.value)}
        />
      </Form.Item>

      {/* 프로젝트 목표 */}
      <Form.Item label="프로젝트 목표" required>
        <TextArea
          rows={3}
          placeholder="프로젝트의 주요 목표를 입력하세요."
          value={value.projectGoal || ""}
          onChange={(e) => update("projectGoal", e.target.value)}
        />
      </Form.Item>

      {/* 프로젝트 일정 */}
      <Form.Item label="프로젝트 일정" required>
        <RangePicker
          style={{ width: "100%" }}
          value={
            value.startDate && value.endDate
              ? [dayjs(value.startDate), dayjs(value.endDate)]
              : null
          }
          onChange={handleDateChange}
        />
      </Form.Item>

      <Form.Item label="예상 소요일수">
        <InputNumber
          value={value.duration || 0}
          readOnly
          style={{ width: "100%" }}
          addonAfter="일"
        />
      </Form.Item>

      {/* 참여 인원 */}
      <Form.Item label="참여 인원" required>
        <Select
          mode="multiple"
          placeholder="프로젝트에 참여할 인원을 선택하세요"
          options={employeeOptions}
          value={value.participants || []}
          onChange={(val) => update("participants", val)}
          showSearch
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Divider />

      {/* 예산 항목 */}
      <Form.Item label="예산 항목" required>
        {(value.budgetItems || []).map((item, index) => (
          <Space
            key={index}
            style={{
              display: "flex",
              marginBottom: 8,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="항목명 (예: 장비 구입비)"
              style={{ flex: 2 }}
              value={item.itemName}
              onChange={(e) =>
                handleBudgetChange(index, "itemName", e.target.value)
              }
            />
            <InputNumber
              placeholder="금액"
              min={0}
              style={{ flex: 1 }}
              value={item.amount}
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(val) => val.replace(/,/g, "")}
              onChange={(val) => handleBudgetChange(index, "amount", val)}
            />
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeBudgetItem(index)}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          onClick={addBudgetItem}
          icon={<PlusOutlined />}
          block
        >
          + 예산 항목 추가
        </Button>
      </Form.Item>

      {/* 총 예산 */}
      <Form.Item label="총 예산">
        <Input prefix="₩" value={totalBudget.toLocaleString()} readOnly />
      </Form.Item>

      {/* 프로젝트 개요 / 기대효과 */}
      <Form.Item label="프로젝트 개요" required>
        <TextArea
          rows={4}
          placeholder="프로젝트의 배경과 개요를 간략히 작성하세요."
          value={value.projectOverview || ""}
          onChange={(e) => update("projectOverview", e.target.value)}
        />
      </Form.Item>

      <Form.Item label="기대효과" required>
        <TextArea
          rows={3}
          placeholder="프로젝트 완료 후 기대되는 효과를 입력하세요."
          value={value.expectedEffect || ""}
          onChange={(e) => update("expectedEffect", e.target.value)}
        />
      </Form.Item>
    </>
  );
};

export default ProjectPlanForm;
