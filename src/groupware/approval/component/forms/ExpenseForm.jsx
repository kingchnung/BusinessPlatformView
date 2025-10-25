import React, { useEffect, useMemo } from "react";
import { Form, Input, InputNumber, DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { TextArea } = Input;

const ExpenseForm = ({ value = {}, onChange }) => {
    const { user: currentUser } = useSelector((state) => state.auth);
    useFormInitializer(currentUser, value, onChange);
    const update = (key, val) => {
        const newValue = { ...value, [key]: val };
        onChange?.(newValue);
    };

    // ✅ 항목 변경 처리
    const handleItemChange = (index, field, val) => {
        const updated = [...(value.expenseItems || [])];

        // 현재 항목 복사
        const current = { ...updated[index], [field]: val };

        // 🧮 단가/수량 중 하나가 변경되면 자동 계산
        const unit = Number(field === "unitPrice" ? val : current.unitPrice) || 0;
        const qty = Number(field === "quantity" ? val : current.quantity) || 0;
        current.amount = unit * qty;

        updated[index] = current;
        update("expenseItems", updated);
    };

    // ✅ 항목 추가/삭제
    const addItem = () => {
        const updated = [...(value.expenseItems || []), { name: "", amount: 0, note: "" }];
        update("expenseItems", updated);
    };

    const removeItem = (index) => {
        const updated = [...(value.expenseItems || [])];
        updated.splice(index, 1);
        update("expenseItems", updated);
    };

    // 🆕 총 지출 금액 자동 계산
    const totalAmount = useMemo(() => {
        const items = value.expenseItems || [];
        return items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [value.expenseItems]);

    return (
        <>
            {/* 작성자 / 부서 */}
            <Form.Item label="작성자">
                <Input value={value.drafterName || ""} readOnly />
            </Form.Item>
            <Form.Item label="소속 부서">
                <Input value={value.drafterDept || ""} readOnly />
            </Form.Item>

            {/* 작성일 */}
            <Form.Item label="작성일">
                <DatePicker
                    style={{ width: "100%" }}
                    value={value.createdDate ? dayjs(value.createdDate) : dayjs()}
                    onChange={(date) => update("createdDate", date)}
                />
            </Form.Item>

            {/* 사용일자 */}
            <Form.Item label="지출 일자" required>
                <DatePicker
                    style={{ width: "100%" }}
                    value={value.expenseDate ? dayjs(value.expenseDate) : null}
                    onChange={(date) => update("expenseDate", date)}
                />
            </Form.Item>

            {/* 🆕 지출 항목 리스트 (비고 제거 / 수량 추가) */}
            <Form.Item label="지출 항목" required>
                {(value.expenseItems || []).map((item, index) => (
                    <Space
                        key={index}
                        style={{
                            display: "flex",
                            marginBottom: 12,
                            width: "100%",
                            alignItems: "center",
                        }}
                        align="baseline"
                    >
                        {/* 항목명 */}
                        <Input
                            placeholder="항목명 (예: 교통비)"
                            style={{ flex: 2, minWidth: 200 }}
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        />
                        {/* 단가 */}
                        <InputNumber
                            placeholder="단가"
                            min={0}
                            style={{ flex: 1, minWidth: 120 }}
                            value={item.unitPrice}
                            onChange={(val) => handleItemChange(index, "unitPrice", val)}
                        />
                        {/* 수량 */}
                        <InputNumber
                            placeholder="수량"
                            min={1}
                            style={{ flex: 1, minWidth: 100 }}
                            value={item.quantity}
                            onChange={(val) => handleItemChange(index, "quantity", val)}
                        />
                        {/* 금액 자동 계산 */}
                        <Input
                            value={(item.amount || 0).toLocaleString()}
                            readOnly
                            prefix="₩"
                            style={{
                                flex: 1,
                                minWidth: 140,
                                backgroundColor: "#fafafa",
                                textAlign: "right",
                            }}
                        />
                        {/* 삭제 버튼 */}
                        <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeItem(index)}
                        />
                    </Space>
                ))}

                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addItem}
                    block
                    style={{ marginTop: 10, height: 38, fontWeight: 500 }}
                >
                    항목 추가
                </Button>
            </Form.Item>

            {/* 총 합계 */}
            <Form.Item label="총 지출 금액">
                <Input
                    prefix="₩"
                    value={totalAmount.toLocaleString()}
                    readOnly
                    style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}
                />
            </Form.Item>

            {/* 지출 사유 */}
            <Form.Item label="지출 사유" required>
                <TextArea
                    rows={4}
                    placeholder="지출 사유를 구체적으로 입력하세요."
                    value={value.reason || ""}
                    onChange={(e) => update("reason", e.target.value)}
                />
            </Form.Item>
        </>
    );
};

export default ExpenseForm;
