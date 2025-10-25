import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, DatePicker, Select, InputNumber } from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const LeaveForm = ({ value = {}, onChange }) => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [remainingLeave, setRemainingLeave] = useState(12); // 기본 잔여연차 (API 연동 가능)
    useFormInitializer(currentUser, value, onChange);

    const update = (key, val) => {
        const newValue = { ...value, [key]: val };
        onChange?.(newValue);
    };

    // ✅ 휴가 기간 선택 시 일수 계산
    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            const diff = end.diff(start, "day") + 1;
            update("startDate", start);
            update("endDate", end);
            update("leaveDays", diff);
        } else {
            update("startDate", null);
            update("endDate", null);
            update("leaveDays", 0);
        }
    };

    // ✅ 휴가 유형 변경 시 기본 문구 자동 삽입
    const handleTypeChange = (val) => {
        const typeMessages = {
            연차: "연차 사용을 신청합니다.",
            반차: "반차 사용을 신청합니다.",
            병가: "병가 사유로 인한 휴가를 신청합니다.",
            경조사: "가족 경조사로 인한 휴가를 신청합니다.",
            기타: "",
        };
        update("leaveType", val);
        update("reason", typeMessages[val] || "");
    };

    // ✅ 잔여연차 계산 (useMemo로 최적화)
    const usedLeave = useMemo(() => value.leaveDays || 0, [value.leaveDays]);
    const calculatedRemaining = useMemo(
        () => remainingLeave - usedLeave,
        [remainingLeave, usedLeave]
    );

    return (
        <>
            {/* 작성자 / 부서 */}
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

            {/* 휴가 유형 */}
            <Form.Item label="휴가 유형" required>
                <Select
                    placeholder="휴가 유형 선택"
                    value={value.leaveType || ""}
                    onChange={handleTypeChange}
                    options={[
                        { value: "연차", label: "연차" },
                        { value: "반차", label: "반차" },
                        { value: "병가", label: "병가" },
                        { value: "경조사", label: "경조사" },
                        { value: "기타", label: "기타" },
                    ]}
                />
            </Form.Item>

            {/* 휴가 기간 */}
            <Form.Item label="휴가 기간" required>
                <RangePicker
                    value={
                        value.startDate && value.endDate
                            ? [dayjs(value.startDate), dayjs(value.endDate)]
                            : null
                    }
                    onChange={handleDateChange}
                    style={{ width: "100%" }}
                />
            </Form.Item>

            {/* 총 휴가일수 */}
            <Form.Item label="총 휴가일수">
                <InputNumber
                    value={value.leaveDays || 0}
                    readOnly
                    addonAfter="일"
                    style={{ width: "100%" }}
                />
            </Form.Item>

            {/* 잔여 연차 */}
            <Form.Item label="잔여 연차">
                <InputNumber
                    value={calculatedRemaining}
                    readOnly
                    addonAfter="일"
                    style={{ width: "100%" }}
                />
            </Form.Item>

            {/* 휴가 사유 */}
            <Form.Item label="휴가 사유" required>
                <TextArea
                    rows={4}
                    placeholder="휴가 사유를 구체적으로 입력하세요."
                    value={value.reason || ""}
                    onChange={(e) => update("reason", e.target.value)}
                />
            </Form.Item>
        </>
    );
};

export default LeaveForm;
