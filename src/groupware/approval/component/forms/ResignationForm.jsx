import React, { useEffect } from "react";
import { Form, Input, DatePicker, Select, Divider, message } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { TextArea } = Input;

const ResignationForm = ({ value = {}, onChange, employeeOptions = [] }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  useFormInitializer(currentUser, value, onChange);

  /** ✅ 상위 상태 업데이트 핸들러 */
  const update = (key, val) => {
    const newValue = { ...value, [key]: val };
    onChange?.(newValue);
  };

  /** ✅ 퇴사일 유효성 검사 */
  const handleResignDate = (date) => {
    if (date && date.isBefore(dayjs(), "day")) {
      message.warning("퇴사 예정일은 오늘 이후 날짜만 선택 가능합니다.");
      return;
    }
    update("resignDate", date ? date.format("YYYY-MM-DD") : null);
  };

  return (
    <>
      {/* ===========================
          기본 정보
      ============================ */}
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

      {/* ===========================
          퇴사일
      ============================ */}
      <Form.Item
        label="퇴사 예정일"
        required
        tooltip="마지막 근무일을 선택하세요."
      >
        <DatePicker
          style={{ width: "100%" }}
          value={value.resignDate ? dayjs(value.resignDate) : null}
          onChange={handleResignDate}
          disabledDate={(current) =>
            current && current < dayjs().startOf("day")
          }
        />
      </Form.Item>

      {/* ===========================
          퇴직 사유
      ============================ */}
      <Form.Item label="퇴직 사유" required>
        <TextArea
          rows={4}
          placeholder={`예:
- 개인 사정으로 인한 퇴직
- 진학 / 이직 사유 등`}
          value={value.reason || ""}
          onChange={(e) => update("reason", e.target.value)}
        />
      </Form.Item>

      {/* ===========================
          인수인계자
      ============================ */}
      <Form.Item
        label="인수인계자"
        required
        tooltip="업무를 인수받을 직원을 선택하세요."
      >
        <Select
          placeholder="인수인계자 선택"
          options={employeeOptions}
          value={value.handoverEmpId || null}
          onChange={(val) => update("handoverEmpId", val)}
          showSearch
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      {/* ===========================
          인수인계 내용
      ============================ */}
      <Form.Item label="인수인계 내용" required>
        <TextArea
          rows={4}
          placeholder={`예:
- 프로젝트 진행 현황 정리
- 클라이언트 연락처 전달
- 서버 접근 계정 정보 인계`}
          value={value.handoverDetails || ""}
          onChange={(e) => update("handoverDetails", e.target.value)}
        />
      </Form.Item>

      {/* ===========================
          추가 코멘트
      ============================ */}
      <Form.Item label="비고 (선택)">
        <TextArea
          rows={2}
          placeholder="추가 코멘트나 인사말을 입력하세요."
          value={value.remark || ""}
          onChange={(e) => update("remark", e.target.value)}
        />
      </Form.Item>
    </>
  );
};

export default ResignationForm;
