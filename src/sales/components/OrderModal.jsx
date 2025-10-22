import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Modal, Form, Input, Button, message, Row, Col, DatePicker,
  InputNumber, Typography, Table, Spin
} from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { registerOrder, modifyOrder, getOrder } from "../../api/sales/orderApi";
import ClientSearchModal from "./ClientSearchModal";
import dayjs from 'dayjs';

const OrderModal = ({ open, onClose, orderData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!orderData;
  const { user: currentUser } = useSelector((state) => state.auth);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSelectClient = (client) => {
    if (client) {
      form.setFieldsValue({
        clientId: client.clientId,
        clientCompany: client.clientCompany,
      });
    }
    setIsClientModalOpen(false);
  };

  const handleValuesChange = (changedValues, allValues) => {
    let subTotalSum = 0;
    let vatSum = 0;
    let shouldUpdateForm = false;
    const currentItems = form.getFieldValue('orderItems') || [];
    const updatedItems = [...currentItems];

    if (changedValues && changedValues.orderItems) {
      changedValues.orderItems.forEach((changedItem, index) => {
        if (changedItem && changedItem.unitPrice !== undefined && updatedItems[index]) {
          const newUnitPrice = Number(changedItem.unitPrice || 0);
          const calculatedVat = Math.floor(newUnitPrice * 0.1);
          updatedItems[index] = { ...updatedItems[index], unitVat: calculatedVat };
          shouldUpdateForm = true;
        }
      });
    }

    if (shouldUpdateForm) {
      setTimeout(() => form.setFieldsValue({ orderItems: updatedItems }), 0);
    }

    const finalItems = shouldUpdateForm ? updatedItems : currentItems;
    finalItems.forEach(item => {
      const qty = item?.quantity || 0;
      const price = item?.unitPrice || 0;
      const vat = item?.unitVat || 0;
      subTotalSum += Number(qty) * Number(price);
      vatSum += Number(qty) * Number(vat);
    });
    setTotalOrderAmount(subTotalSum + vatSum);
  };

  // 모달 열릴 때 폼 세팅
  useEffect(() => {
    const init = async () => {
      if (!open) return;

      if (isEditing) {
        // orderData가 불완전하면 서버에서 보강
        let detail = orderData;
        if (!orderData.orderItems) {
          try {
            setLoadingDetail(true);
            detail = await getOrder(orderData.orderId);
          } catch {
            message.error("주문 상세를 불러오지 못했습니다.");
          } finally {
            setLoadingDetail(false);
          }
        }

        const formData = {
          ...detail,
          // ✅ DatePicker엔 dayjs 객체
          orderDueDate: detail.orderDueDate ? dayjs(detail.orderDueDate) : null,
          orderDate: detail.orderDate ? dayjs(detail.orderDate) : null,
          writerInfo: `${detail.writer} (${detail.userId})`,
          orderItems: (detail.orderItems || []).map(item => ({
            ...item,
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0),
            unitVat: Number(item.unitVat || item.uintVat || 0)
          }))
        };

        form.setFieldsValue(formData);
        handleValuesChange(null, formData);
      } else {
        // [등록 모드]
        form.resetFields();
        const today = dayjs();
        const orderIdPrefix = today.format('YYYYMMDD');
        const estimatedOrderId = `${orderIdPrefix}-자동생성`;

        form.setFieldsValue({
          orderId: estimatedOrderId,
          // ✅ 사용자가 수정 가능: dayjs 객체로 세팅
          orderDate: today,
          writerInfo: currentUser ? `${currentUser.empName} (${currentUser.username})` : "로그인 정보 없음",
          orderItems: [{ quantity: 1, unitPrice: 0, unitVat: 0 }],
          orderStatus: "시작전",
        });
        setTotalOrderAmount(0);
      }
    };

    init();
  }, [open, orderData, form, isEditing, currentUser]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        // ✅ 서버(LocalDate)로 넘길 때 문자열 포맷으로 변환
        orderDueDate: values.orderDueDate ? values.orderDueDate.format('YYYY-MM-DD') : null,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : null,
        orderItems: (values.orderItems || []).map(item => ({
          ...item,
          orderItemId: item.orderItemId || null,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          unitVat: Number(item.unitVat || 0),
        }))
      };

      // 수정/등록 분기
      if (isEditing) {
        // ✅ 수정 시에는 orderId를 body에 포함시키는 편이 안전
        payload.orderId = orderData.orderId;
        await modifyOrder(orderData.orderId, payload);
        message.success("주문 정보가 수정되었습니다.");
      } else {
        // 등록 시 orderId는 서버에서 생성 (orderIdDate 기반)
        delete payload.orderId;
        await registerOrder(payload);
        message.success("신규 주문이 등록되었습니다.");
      }

      onClose();
      onRefresh();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "처리 중 오류가 발생했습니다.";
      message.error(errorMessage);
    }
  };

  const orderItemColumns = (remove) => [
    {
      title: 'No.',
      key: 'index',
      width: '5%',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '품목명',
      dataIndex: 'itemName',
      key: 'itemName',
      width: '25%',
      align: 'center',
      render: (_, field) => (
        <Form.Item name={[field.name, 'itemName']} rules={[{ required: true, message: '품명을 입력하세요.' }]} style={{ marginBottom: 0 }}>
          <Input placeholder="품목명" />
        </Form.Item>
      ),
    },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      align: 'center',
      render: (_, field) => (
        <Form.Item name={[field.name, 'unitPrice']} rules={[{ required: true, type: 'number', min: 0, message: '0 이상' }]} style={{ marginBottom: 0 }}>
          <InputNumber
            style={{ width: '100%', textAlign: 'right' }}
            placeholder="공급가액"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      ),
    },
    {
      title: '부가세',
      dataIndex: 'unitVat',
      key: 'unitVat',
      width: '15%',
      align: 'center',
      render: (_, field) => (
        <Form.Item name={[field.name, 'unitVat']} rules={[{ required: true, type: 'number', min: 0, message: '0 이상' }]} style={{ marginBottom: 0 }}>
          <InputNumber
            style={{ width: '100%', textAlign: 'right' }}
            placeholder="부가세액"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      ),
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      align: 'center',
      render: (_, field) => (
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true, type: 'number', min: 1, message: '1 이상' }]} style={{ marginBottom: 0 }}>
          <InputNumber style={{ width: '100%', textAlign: 'right' }} placeholder="수량" />
        </Form.Item>
      ),
    },
    {
      title: '금액',
      key: 'totalAmount',
      width: '15%',
      align: 'center',
      render: (_, field) => {
        const quantity = form.getFieldValue(['orderItems', field.name, 'quantity']) || 0;
        const unitPrice = form.getFieldValue(['orderItems', field.name, 'unitPrice']) || 0;
        const unitVat = form.getFieldValue(['orderItems', field.name, 'unitVat']) || 0;
        const itemTotal = (Number(quantity) * Number(unitPrice)) + (Number(quantity) * Number(unitVat));
        return <div style={{ textAlign: 'right', paddingRight: '11px' }}>{itemTotal.toLocaleString('ko-KR')}</div>;
      },
    },
    {
      title: '비고',
      dataIndex: 'itemNote',
      key: 'itemNote',
      width: '10%',
      align: 'center',
      render: (_, field) => (
        <Form.Item name={[field.name, 'itemNote']} style={{ marginBottom: 0 }}>
          <Input placeholder="비고" />
        </Form.Item>
      ),
    },
    {
      title: ' ',
      key: 'action',
      width: '5%',
      align: 'center',
      render: (_, field, index) => {
        if (index === 0) return null;
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(field.name)}
            disabled={index === 0}
          />
        )
      },
    },
  ];

  return (
    <Modal
      title={isEditing ? "주문 상세 및 수정" : "신규 주문 등록"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      <Spin spinning={loadingDetail}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onValuesChange={handleValuesChange}
          style={{ marginTop: 24 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="orderId" label="주문번호">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              {/* ✅ 주문일자: 편집 가능 */}
              <Form.Item name="orderDate" label="주문일자" rules={[{ required: true, message: "주문일자를 선택하세요." }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="writerInfo" label="담당자">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="orderStatus" label="주문상태">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="clientId"
                label="사업자번호"
                rules={[{ required: true, message: "거래처를 선택하거나 입력하세요."}]}
              >
                <Input
                  placeholder="검색버튼 클릭 또는 직접 입력"
                  addonAfter={
                    <Button
                      icon={<SearchOutlined />}
                      onClick={() => setIsClientModalOpen(true)}
                      style={{ background: 'none', border: 'none', padding: 0 }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="clientCompany"
                label="거래처명"
                rules={[{ required: true, message: "거래처를 선택하거나 입력하세요."}]}
              >
                <Input placeholder="자동 입력 또는 직접 입력" />
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="projectId" label="프로젝트 번호"><Input placeholder="프로젝트 번호" /></Form.Item></Col>
            <Col span={6}><Form.Item name="projectName" label="프로젝트명"><Input /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderDueDate" label="납기 예정일">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="주문 합계">
                <InputNumber
                  value={totalOrderAmount}
                  readOnly
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%", fontWeight: 'bold', textAlign: 'right' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="orderNote" label="주문 비고">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Typography.Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            주문 항목
          </Typography.Title>

          <Form.List name="orderItems">
            {(fields, { add, remove }) => (
              <>
                <Table
                  dataSource={fields}
                  columns={orderItemColumns(remove)}
                  rowKey="key"
                  pagination={false}
                  bordered
                  size="small"
                />
                <Button
                  type="dashed"
                  onClick={() => add({ quantity: 1, unitPrice: 0, unitVat: 0 })}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                >
                  항목 추가
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>취소</Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "수정" : "등록"}
            </Button>
          </div>
        </Form>
      </Spin>

      <ClientSearchModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleSelectClient}
      />
    </Modal>
  );
};

export default OrderModal;
