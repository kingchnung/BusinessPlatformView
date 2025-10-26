import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Select, message } from "antd";
import { fetchEmployees } from "../../../../api/hr/employeeApi";
import { fetchDepartments } from "../../../../api/hr/departmentsAPI";
import { fetchPositions } from "../../../../api/hr/positionAPI";
import { useFormInitializer } from "../../../util/useFormInitializer";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const HRMoveForm = ({ value = {}, onChange }) => {
  const { user: currentUser } = useSelector((s) => s.auth);
  useFormInitializer(currentUser, value, onChange);

  const update = (key, val) => {
    const newValue = { ...value, [key]: val };
    onChange?.(newValue);
  };

  // ✅ Select용 상태값
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [positionList, setPositionList] = useState([]);

  // ✅ 최초 데이터 로드 (직원 / 부서 / 직책)
  useEffect(() => {
    const load = async () => {
      try {
        const [employees, departments, positions] = await Promise.all([
          fetchEmployees(),
          fetchDepartments(),
          fetchPositions(),
        ]);

        // 🔹 직원 리스트 구성 (부서, 직책까지 포함)
        setEmployeeList(
          employees.map((e) => ({
            label: `${e.empName} (${e.deptName})`,
            value: e.empId,
            empName: e.empName,
            deptName: e.deptName,
            positionName: e.positionName,
          }))
        );

        // 🔹 부서 리스트
        setDepartmentList(
          departments.map((d) => ({
            label: d.deptName,
            value: d.deptId,
          }))
        );

        // 🔹 직책 리스트
        setPositionList(
          positions.map((p) => ({
            label: p.positionName,
            value: p.positionCode,
          }))
        );
      } catch (err) {
        console.error(err);
        message.error("기초 데이터 조회 실패");
      }
    };
    load();
  }, []);

  // ✅ 발령 대상자 선택 시 (로컬 데이터에서 즉시 찾기)
  const handleSelectEmployee = (empId) => {
    const emp = employeeList.find((e) => e.value === empId);
    if (!emp) {
      message.warning("직원 정보를 찾을 수 없습니다.");
      return;
    }

    onChange?.({
      ...value,
      targetEmpId: emp.value,
      targetEmpName: emp.empName,
      prevDept: emp.deptName || "",
      prevPosition: emp.positionName || "",
    });
  };

  // ✅ 발령일자 처리
  const handleDateChange = (date) => {
    update("effectiveDate", date ? date.format("YYYY-MM-DD") : null);
  };

  return (
    <>
      {/* ✅ 발령 대상자 */}
      <Form.Item label="발령 대상자" required>
        <Select
          showSearch
          placeholder="직원을 선택하세요"
          options={employeeList}
          value={value.targetEmpId ?? undefined}
          onChange={(v) => handleSelectEmployee(Number(v))}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      {/* 발령 구분 */}
      <Form.Item label="발령 구분">
        <Select
          value={value.moveType}
          onChange={(v) => update("moveType", v)}
          options={[
            { label: "부서 이동", value: "DEPT_TRANSFER" },
            { label: "승진", value: "PROMOTION" },
            { label: "전보", value: "REASSIGNMENT" },
            { label: "직책 변경", value: "POSITION_CHANGE" },
            { label: "기타", value: "OTHER" },
          ]}
          placeholder="발령 구분 선택"
        />
      </Form.Item>

      {/* 발령일자 */}
      <Form.Item label="발령일자">
        <DatePicker
          value={value.effectiveDate ? dayjs(value.effectiveDate) : null}
          onChange={handleDateChange}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* 변경 전 부서 / 직책 */}
      <Form.Item label="변경 전 부서">
        <Input
          value={value.prevDept || ""}
          readOnly
          placeholder="자동 입력 (직원 선택 시)"
        />
      </Form.Item>

      <Form.Item label="변경 전 직책">
        <Input
          value={value.prevPosition || ""}
          readOnly
          placeholder="자동 입력 (직원 선택 시)"
        />
      </Form.Item>

      {/* ✅ 변경 후 부서 / 직책 */}
      <Form.Item label="변경 후 부서">
        <Select
          showSearch
          placeholder="부서를 선택하세요"
          options={departmentList}
          value={value.newDeptId}
          onChange={(v) => update("newDeptId", v)}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item label="변경 후 직책">
        <Select
          showSearch
          placeholder="직책을 선택하세요"
          options={positionList}
          value={value.newPositionCode}
          onChange={(v) => update("newPositionCode", v)}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      {/* 발령 사유 */}
      <Form.Item label="사유">
        <Input.TextArea
          rows={4}
          value={value.reason}
          onChange={(e) => update("reason", e.target.value)}
          placeholder="인사 발령 사유를 입력하세요."
        />
      </Form.Item>
    </>
  );
};

export default HRMoveForm;
