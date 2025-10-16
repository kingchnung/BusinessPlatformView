import React, { useEffect, useMemo } from "react";
import { Form, Input, InputNumber, DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const ExpenseForm = ({ value = {}, onChange }) => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const update = (key, val) => {
        const newValue = { ...value, [key]: val };
        onChange?.(newValue);
    };

    // ✅ 최초 기본값 자동 세팅
    useEffect(() => {
        if (currentUser) {
            update("drafterName", currentUser.empName);
            update("drafterDept", currentUser.deptName);
            update("createdDate", dayjs());
            update("expenseItems", value.expenseItems || [{ name: "", amount: 0, note: "" }]);
        }
    }, [currentUser]);

    // ✅ 항목 합계 계산 (실시간)
    const totalAmount = useMemo(() => {
        return (value.expenseItems || []).reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
        );
    }, [value.expenseItems]);

    // ✅ 항목 변경 처리
    const handleItemChange = (index, field, val) => {
        const updated = [...(value.expenseItems || [])];
        updated[index][field] = val;
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

            {/* 지출 항목 리스트 */}
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
                        <Input
                            placeholder="항목명 (예: 교통비)"
                            style={{ flex: 2, minWidth: 250 }}
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        />
                        <InputNumber
                            placeholder="금액"
                            min={0}
                            style={{
                                flex: 1,
                                minWidth: 150,
                                textAlign: "right",
                            }}
                            value={item.amount}
                            onChange={(val) => handleItemChange(index, "amount", val)}
                        />
                        <Input
                            placeholder="비고 (예: 회의 참석)"
                            style={{ flex: 2, minWidth: 250 }}
                            value={item.note}
                            onChange={(e) => handleItemChange(index, "note", e.target.value)}
                        />
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
