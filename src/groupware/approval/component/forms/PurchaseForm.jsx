import React, { useEffect, useMemo } from "react";
import { Form, Input, InputNumber, Button, Space, Divider } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useFormInitializer } from "../../../util/useFormInitializer";

const { TextArea } = Input;

const PurchaseForm = ({ value = {}, onChange }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  useFormInitializer(currentUser, value, onChange);

  /** ✅ 상위 상태 업데이트 핸들러 */
  const update = (key, val) => {
    const newValue = { ...value, [key]: val };
    onChange?.(newValue);
  };

  /** ✅ 항목별 변경 처리 */
  const handleItemChange = (index, field, val) => {
    const updated = [...(value.items || [])];
    updated[index][field] = val;
    update("items", updated);
  };

  /** ✅ 항목 추가/삭제 */
  const addItem = () => {
    const updated = [
      ...(value.items || []),
      { itemName: "", qty: 1, unitPrice: 0, remark: "" },
    ];
    update("items", updated);
  };

  const removeItem = (index) => {
    const updated = [...(value.items || [])];
    updated.splice(index, 1);
    update("items", updated);
  };

  /** ✅ 금액 계산 (useMemo로 최적화) */
  const subtotal = useMemo(() => {
    return (value.items || []).reduce(
      (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }, [value.items]);

  const vat = useMemo(() => Math.floor(subtotal * 0.1), [subtotal]);
  const totalAmount = useMemo(() => subtotal + vat, [subtotal, vat]);

  return (
    <>
      {/* ===========================
          기본정보
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
          구매 항목
      ============================ */}
      <Form.Item label="구매 항목" required>
        {(value.items || []).map((item, index) => (
          <Space
            key={index}
            style={{
              display: "flex",
              marginBottom: 10,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Input
              placeholder="품목명"
              style={{ flex: 2, minWidth: 180 }}
              value={item.itemName}
              onChange={(e) =>
                handleItemChange(index, "itemName", e.target.value)
              }
            />
            <InputNumber
              placeholder="수량"
              min={1}
              style={{ flex: 1, minWidth: 90 }}
              value={item.qty}
              onChange={(val) => handleItemChange(index, "qty", val)}
            />
            <InputNumber
              placeholder="단가"
              min={0}
              style={{ flex: 1.5, minWidth: 120 }}
              value={item.unitPrice}
              formatter={(val) =>
                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(val) => val.replace(/,/g, "")}
              onChange={(val) => handleItemChange(index, "unitPrice", val)}
            />
            <Input
              readOnly
              value={((item.qty || 0) * (item.unitPrice || 0)).toLocaleString()}
              prefix="₩"
              style={{
                flex: 1.5,
                textAlign: "right",
                background: "#fafafa",
              }}
            />
            <Input
              placeholder="비고"
              style={{ flex: 2, minWidth: 160 }}
              value={item.remark}
              onChange={(e) => handleItemChange(index, "remark", e.target.value)}
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
          style={{ marginTop: 8 }}
        >
          + 항목 추가
        </Button>
      </Form.Item>

      <Divider />

      {/* ===========================
          금액 요약
      ============================ */}
      <Form.Item label="소계">
        <Input prefix="₩" value={subtotal.toLocaleString()} readOnly />
      </Form.Item>

      <Form.Item label="부가세 (10%)">
        <Input prefix="₩" value={vat.toLocaleString()} readOnly />
      </Form.Item>

      <Form.Item label="총 합계 금액">
        <Input
          prefix="₩"
          value={totalAmount.toLocaleString()}
          readOnly
          style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}
        />
      </Form.Item>

      <Divider />

      {/* ===========================
          예산 및 구매 사유
      ============================ */}
      <Form.Item label="예산 항목">
        <Input
          placeholder="예: 개발 장비 예산 / 복리후생비"
          value={value.budgetCategory || ""}
          onChange={(e) => update("budgetCategory", e.target.value)}
        />
      </Form.Item>

      <Form.Item label="구매 사유" required>
        <TextArea
          rows={4}
          placeholder="구매 목적 및 사유를 구체적으로 입력하세요."
          value={value.reason || ""}
          onChange={(e) => update("reason", e.target.value)}
        />
      </Form.Item>
    </>
  );
};

export default PurchaseForm;
