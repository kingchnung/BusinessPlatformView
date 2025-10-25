import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Spin,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getCollection,
  registerCollection,
  modifyCollection,
} from "../../api/sales/collectionApi"; 
import ClientSearchModal from "./ClientSearchModal"; 

/**
 * @param {boolean} open - 모달 열림 여부
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {string | null} collectionId - 수정할 ID (null이면 신규 등록)
 * @param {function} onRefresh - 등록/수정 성공 시 부모(List) 새로고침 콜백
 */
const CollectionModal = ({ open, onClose, collectionId, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!collectionId;
  const [loading, setLoading] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!open) return;

      if (isEditing) {
        // --- 수정 모드 ---
        try {
          setLoading(true);
          const detail = await getCollection(collectionId); // 💡 API 호출

          form.setFieldsValue({
            ...detail,
            collectionDate: detail.collectionDate
              ? dayjs(detail.collectionDate)
              : null,
            collectionMoney: Number(detail.collectionMoney || 0),
          });
        } catch (e) {
          message.error("수금 상세를 불러오지 못했습니다.");
          onClose(); // 데이터 로드 실패 시 모달 닫기
        } finally {
          setLoading(false);
        }
      } else {
        // --- 신규 등록 모드 ---
        form.resetFields();
        form.setFieldsValue({
          collectionId: `${dayjs().format("YYYYMMDD")}-자동생성`,
          collectionDate: dayjs(),
          collectionMoney: 0,
        });
      }
    };
    init();
    // 💡 form, isEditing, onClose, open, collectionId를 의존성 배열에 추가
  }, [open, collectionId, form, isEditing, onClose]); 

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        collectionDate: values.collectionDate
          ? values.collectionDate.format("YYYY-MM-DD")
          : null,
        collectionMoney: Number(values.collectionMoney || 0),
      };

      if (isEditing) {
        payload.collectionId = collectionId; // ID 보장
        await modifyCollection(collectionId, payload); // 💡 수정 API
        message.success("수금 정보가 수정되었습니다.");
      } else {
        delete payload.collectionId; // 자동 생성이므로 ID 제거
        await registerCollection(payload); // 💡 등록 API
        message.success("신규 수금이 등록되었습니다.");
      }

      onRefresh?.(); // 💡 부모 컴포넌트(리스트) 새로고침
      // onClose(); // 💡 onRefresh에서 onClose를 호출하므로 중복 호출 방지
    } catch (e) {
      const msg =
        e?.response?.data?.message || "처리 중 오류가 발생했습니다.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 거래처 검색 모달에서 선택 시
  const handleSelectClient = (client) => {
    form.setFieldsValue({
      clientId: client.clientId,
      clientCompany: client.clientCompany,
    });
    setIsClientModalOpen(false);
  };

  return (
    <>
      <Modal
        title={isEditing ? "수금 상세 및 수정" : "신규 수금 등록"}
        open={open}
        onCancel={onClose}
        footer={null} // Form 내부 버튼 사용
        width={800}
        destroyOnClose // 모달 닫힐 때 내부 state 초기화
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            style={{ marginTop: 24 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="collectionId" label="수금번호">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="collectionDate"
                  label="수금일자"
                  rules={[
                    { required: true, message: "수금일자를 선택하세요." },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="clientId"
                  label="거래처 사업자번호"
                  rules={[
                    { required: true, message: "거래처를 선택하세요." },
                  ]}
                >
                  <Input
                    placeholder="우측 버튼으로 검색"
                    readOnly
                    addonAfter={
                      <Button
                        icon={<SearchOutlined />}
                        onClick={() => setIsClientModalOpen(true)}
                        style={{ background: "none", border: "none", padding: 0 }}
                      />
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="clientCompany"
                  label="거래처명"
                  rules={[
                    { required: true, message: "거래처를 선택하세요." },
                  ]}
                >
                  <Input placeholder="거래처 검색 시 자동 입력" readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="collectionMoney"
              label="수금액"
              rules={[
                {
                  required: true,
                  type: "number",
                  min: 0,
                  message: "수금액을 0 이상 입력하세요.",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%", textAlign: "right" }}
                placeholder="수금액 입력"
                formatter={(v) =>
                  `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item name="collectionNote" label="수금 비고">
              <Input.TextArea rows={4} placeholder="수금 관련 메모" />
            </Form.Item>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <Button onClick={onClose} style={{ marginRight: 8 }}>
                취소
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditing ? "수정" : "등록"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* 거래처 검색 모달 */}
      <ClientSearchModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleSelectClient}
      />
    </>
  );
};

export default CollectionModal;