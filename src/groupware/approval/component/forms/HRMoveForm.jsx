import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Select, message } from "antd";
import { fetchEmployeeDetail, fetchEmployees } from "../../../../api/hr/employeeApi";
import { fetchDepartments } from "../../../../api/hr/departmentsAPI";
import { fetchPositions } from "../../../../api/hr/positionAPI";

const HRMoveForm = ({ value = {}, onChange }) => {
    const update = (key, val) => {
        const newValue = { ...value, [key]: val };
        onChange?.(newValue);
    };

    // ✅ 셀렉트용 상태
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);

    // ✅ 데이터 로드
    useEffect(() => {
        const load = async () => {
            try {
                const employees = await fetchEmployees();
                const departments = await fetchDepartments();
                const positions = await fetchPositions();

                setEmployeeOptions(
                    employees.map((e) => ({
                        label: `${e.empName} (${e.deptName})`,
                        value: e.empId,
                    }))
                );
                setDepartmentOptions(
                    departments.map((d) => ({
                        label: d.deptName,
                        value: d.deptId,
                    }))
                );
                setPositionOptions(
                    positions.map((p) => ({
                        label: p.positionName,
                        value: p.positionCode,
                    }))
                );
            } catch (err) {
                message.error("기초 데이터 조회 실패", err);
            }
        };
        load();
    }, []);


    // ✅ 직원 선택 시 상세 조회 → 상위로 전달
    const handleSelectEmployee = async (empId) => {
        update("targetEmpId", empId);
        try {
            const emp = await fetchEmployeeDetail(empId);
            console.log("📋 직원 상세:", emp);

            update("prevDept", emp.deptName || "");
            update("prevPosition", emp.positionName || "");
            update("targetEmpName", emp.empName || "");
        } catch (e) {
            console.error(e);
            message.error("직원 조회 실패");
        }
    };

    return (
        <>
            {/* ✅ 발령 대상자 */}
            <Form.Item label="발령 대상자" required>
                <Select
                    showSearch
                    placeholder="직원을 선택하세요"
                    options={employeeOptions}
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
                    value={value.effectiveDate}
                    onChange={(d) => update("effectiveDate", d)}
                    style={{ width: "100%" }}
                />
            </Form.Item>

            {/* 변경 전 부서 / 직책 */}
            <Form.Item label="변경 전 부서">
                <Input
                    value={value.prevDept || ""}
                    onChange={(e) => update("prevDept", e.target.value)}
                    placeholder="자동 입력 (직원 선택 시)"
                />
            </Form.Item>

            <Form.Item label="변경 전 직책">
                <Input
                    value={value.prevPosition || ""}
                    onChange={(e) => update("prevPosition", e.target.value)}
                    placeholder="자동 입력 (직원 선택 시)"
                />
            </Form.Item>

            {/* ✅ 변경 후 부서 / 직책 (Select로 변경) */}
            <Form.Item label="변경 후 부서">
                <Select
                    showSearch
                    placeholder="부서를 선택하세요"
                    options={departmentOptions}
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
                    placeholder="직위를 선택하세요"
                    options={positionOptions}
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
