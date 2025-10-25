import React, { useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Divider } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { TextArea } = Input;

const EstimateProposalForm = ({
    value = {},
    onChange,
    departmentOptions = [],
}) => {
    const { user: currentUser } = useSelector((state) => state.auth);

    useFormInitializer(currentUser, value, onChange);
    const update = (key, val) => {
        const newValue = { ...value, [key]: val };
        onChange?.(newValue);
    };


    return (
        <>
            {/* 기본 정보 */}
            <Form.Item label="작성자">
                <Input value={value.drafterName || ""} readOnly />
            </Form.Item>

            <Form.Item label="소속 부서">
                <Input value={value.drafterDept || ""} readOnly />
            </Form.Item>

            <Form.Item label="작성일">
                <Input value={dayjs().format("YYYY-MM-DD")} readOnly />
            </Form.Item>

            <Divider />

            {/* 고객사 정보 */}
            <Form.Item label="고객사명" required>
                <Input
                    placeholder="예: (주)비즈메이트테크"
                    value={value.clientName || ""}
                    onChange={(e) => update("clientName", e.target.value)}
                />
            </Form.Item>

            <Form.Item label="고객 담당자명" required>
                <Input
                    placeholder="예: 김영업 팀장"
                    value={value.clientManager || ""}
                    onChange={(e) => update("clientManager", e.target.value)}
                />
            </Form.Item>

            <Form.Item label="담당자 연락처" required>
                <Input
                    placeholder="예: 010-1234-5678"
                    value={value.clientPhone || ""}
                    onChange={(e) => update("clientPhone", e.target.value)}
                />
            </Form.Item>

            <Divider />

            {/* 제안 / 견적 정보 */}
            <Form.Item label="제안/견적 제목" required>
                <Input
                    placeholder="예: A사 ERP 구축 제안"
                    value={value.proposalTitle || ""}
                    onChange={(e) => update("proposalTitle", e.target.value)}
                />
            </Form.Item>

            <Form.Item label="견적 총액" required>
                <InputNumber
                    placeholder="예: 5000000"
                    min={0}
                    style={{ width: "100%" }}
                    value={value.totalAmount || 0}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(val) => val.replace(/,/g, "")}
                    onChange={(val) => update("totalAmount", val)}
                />
            </Form.Item>

            <Form.Item label="발송 예정일" required>
                <DatePicker
                    style={{ width: "100%" }}
                    value={value.sendDate ? dayjs(value.sendDate) : null}
                    onChange={(date) => update("sendDate", date ? date.format("YYYY-MM-DD") : null)}
                />
            </Form.Item>

            <Divider />

            {/* 주요 항목 요약 */}
            <Form.Item label="주요 항목 요약" required>
                <TextArea
                    rows={5}
                    placeholder={`예:
                    - ERP 시스템 구축 (5,000,000원)
                    - 유지보수 계약 (연간 1,200,000원)
                    - 커스터마이징 3건 포함`}
                    value={value.itemSummary || ""}
                    onChange={(e) => update("itemSummary", e.target.value)}
                />
            </Form.Item>

            {/* 관련 부서 */}
            <Form.Item label="관련 부서 (선택)">
                <Select
                    mode="multiple"
                    placeholder="검토 또는 협조가 필요한 부서를 선택하세요"
                    options={departmentOptions}
                    value={value.relatedDepts || []}
                    onChange={(val) => update("relatedDepts", val)}
                    showSearch
                    filterOption={(input, option) =>
                        option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Form.Item>

            {/* 비고 */}
            <Form.Item label="비고">
                <TextArea
                    rows={3}
                    placeholder="추가 코멘트 또는 특이사항을 입력하세요."
                    value={value.remark || ""}
                    onChange={(e) => update("remark", e.target.value)}
                />
            </Form.Item>
        </>
    );
};

export default EstimateProposalForm;
