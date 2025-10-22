import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, Form, InputNumber, Button, message, Row, Col, Input } from "antd";
import { registerSalesTarget, modifySalesTarget } from "../../api/sales/salesTargetApi";
import dayjs from "dayjs";

const SalesTargetModal = ({ open, onClose, targetData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!targetData;
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (open) {
      if (isEditing) {
        // [수정 모드]
        const displayData = {
          ...targetData,
          writerInfo: `${targetData.writer} (${targetData.userId})`,
        };
        form.setFieldsValue(displayData);
      } else {
        // [등록 모드]
        form.resetFields();
        const today = dayjs(); // dayjs 객체 생성
        const formattedDate = today.format("YYYY-MM-DD");
        form.setFieldsValue({
          // 👇 [수정] today.getFullYear() -> today.year()
          targetYear: today.year(),
          writerInfo: currentUser
            ? `${currentUser.empName} (${currentUser.username})`
            : "로그인 정보 없음",
          registrationDate: formattedDate,
        });
      }
    }
  }, [open, targetData, form, isEditing, currentUser]);

  const handleFinish = async (values) => {
    try {
      const payload = { ...values };
      delete payload.writerInfo;
      delete payload.registrationDate;

      if (isEditing) {
        await modifySalesTarget(targetData.targetId, payload);
        message.success("매출 목표가 수정되었습니다.");
      } else {
        await registerSalesTarget(payload);
        message.success("신규 매출 목표가 등록되었습니다.");
      }
      onClose();
      onRefresh();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "처리 중 오류가 발생했습니다.";
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title={isEditing ? "매출 목표 수정" : "신규 매출 목표 등록"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="registrationDate" label="등록일">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="writerInfo" label="담당자">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="targetYear"
              label="목표 연도"
              rules={[{ required: true, message: "연도를 입력해주세요." }]}
            >
              <InputNumber style={{ width: "100%" }} placeholder="예: 2025" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="targetMonth"
              label="목표 월"
              rules={[{ required: true, message: "월을 입력해주세요." }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={12}
                placeholder="1 ~ 12"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="targetAmount"
          label="목표 금액 (원)"
          rules={[{ required: true, message: "금액을 입력해주세요." }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="숫자만 입력"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            취소
          </Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? "수정" : "등록"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SalesTargetModal;

