import React, { useEffect, useState } from "react";
import {
  Modal, Form, Input, Button, message, Row, Col,
  DatePicker, InputNumber, Typography, Table, Switch, Spin
} from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getSales, registerSales, modifySales } from "../../api/sales/salesApi";
import ClientSearchModal from "./ClientSearchModal";
import OrderSearchModal from "./OrderSearchModal";

const toBool = (v) =>
  v === true || v === 1 || v === "1" || v === "Y" || v === "y" || v === "true" || v === "TRUE";

const SalesModal = ({ open, onClose, salesData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!salesData?.salesId;

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const recalcTotal = () => {
    const items = form.getFieldValue("salesItems") || [];
    let sum = 0;
    items.forEach((it) => {
      const q = Number(it?.quantity || 0);
      const p = Number(it?.unitPrice || 0);
      const v = Number(it?.unitVat || 0);
      sum += q * (p + v);
    });
    setTotalSalesAmount(sum);
  };

  const handleValuesChange = (changed) => {
    if (changed?.salesItems) {
      const current = form.getFieldValue("salesItems") || [];
      const updated = [...current];
      Object.entries(changed.salesItems).forEach(([idxStr, changedItem]) => {
        const idx = Number(idxStr);
        if (changedItem && "unitPrice" in changedItem && updated[idx]) {
          const price = Number(changedItem.unitPrice || 0);
          updated[idx] = { ...updated[idx], unitVat: Math.floor(price * 0.1) };
        }
      });
      form.setFieldsValue({ salesItems: updated });
    }
    recalcTotal();
  };

  useEffect(() => {
    const init = async () => {
      if (!open) return;

      if (isEditing) {
        try {
          setLoadingDetail(true);
          const detail = await getSales(salesData.salesId);

          const formData = {
            salesId: detail.salesId,
            salesDate: detail.salesDate ? dayjs(detail.salesDate) : null,
            deploymentDate: detail.deploymentDate ? dayjs(detail.deploymentDate) : null,

            // 🔴 명시적 매핑 (중첩 구조까지 커버)
            orderId:
              detail.orderId ??
              detail.order?.orderId ??
              salesData?.orderId ??
              "",

            clientId: detail.clientId ?? detail.client?.clientId ?? "",
            clientCompany: detail.clientCompany ?? detail.client?.clientCompany ?? "",
            projectId: detail.projectId ?? detail.project?.projectId ?? "",
            projectName: detail.projectName ?? detail.project?.projectName ?? "",

            // 🔴 Switch와 호환되게 boolean 정규화
            invoiceIssued: toBool(detail.invoiceIssued ?? detail.issued),

            salesItems: (detail.salesItems || []).map((it) => ({
              ...it,
              quantity: Number(it.quantity || 0),
              unitPrice: Number(it.unitPrice || 0),
              unitVat: Number(it.unitVat || 0),
            })),
          };

          form.setFieldsValue(formData);
          setTimeout(recalcTotal, 0); // 다음 틱에서 합계 계산
        } catch (e) {
          message.error("판매 상세를 불러오지 못했습니다.");
        } finally {
          setLoadingDetail(false);
        }
      } else {
        form.setFieldsValue({
          salesId: `${dayjs().format("YYYYMMDD")}-자동생성`,
          salesDate: dayjs(),
          invoiceIssued: false,
          salesItems: [{ quantity: 1, unitPrice: 0, unitVat: 0 }],
        });
        setTotalSalesAmount(0);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, salesData?.salesId]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        salesDate: values.salesDate ? values.salesDate.format("YYYY-MM-DD") : null,
        deploymentDate: values.deploymentDate ? values.deploymentDate.format("YYYY-MM-DD") : null,
        // 서버가 boolean을 받는다고 가정(만약 Y/N 필요하면 여기서 변환)
        invoiceIssued: !!values.invoiceIssued,
        salesItems: (values.salesItems || []).map((it) => ({
          ...it,
          salesItemId: it.salesItemId || null,
          quantity: Number(it.quantity || 0),
          unitPrice: Number(it.unitPrice || 0),
          unitVat: Number(it.unitVat || 0),
        })),
      };

      if (isEditing) {
        payload.salesId = salesData.salesId;
        await modifySales(salesData.salesId, payload);
        message.success("판매 정보가 수정되었습니다.");
      } else {
        delete payload.salesId;
        await registerSales(payload);
        message.success("신규 판매가 등록되었습니다.");
      }

      // 부모가 즉시 갱신(낙관적 갱신 또는 재조회 트리거)
      onRefresh?.(payload);
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || "처리 중 오류가 발생했습니다.";
      message.error(msg);
    }
  };

  const handleSelectOrder = (orderDetailOrRow) => {
    const od = orderDetailOrRow || {};
    const orderItems = od.orderItems || od.items || [];

    form.setFieldsValue({
      orderId: od.orderId,
      clientId: od.clientId,
      clientCompany: od.clientCompany,
      projectId: od.projectId,
      projectName: od.projectName,
    });

    const mappedItems = (orderItems || []).map((it) => {
      const price = Number(it.unitPrice ?? it.subAmount ?? it.price ?? 0);
      const vat = Number(it.unitVat ?? it.vatAmount ?? Math.floor(price * 0.1));
      return {
        itemName: it.itemName ?? it.productName ?? "",
        quantity: Number(it.quantity ?? 1),
        unitPrice: price,
        unitVat: vat,
        itemNote: it.itemNote ?? it.note ?? "",
      };
    });

    const currentItems = form.getFieldValue("salesItems") || [];

    const setAndRecalc = (items) => {
      form.setFieldsValue({ salesItems: items });
      setTimeout(recalcTotal, 0);
    };

    const isEmptyInitial =
      currentItems.length === 0 ||
      (currentItems.length === 1 &&
        !currentItems[0]?.itemName &&
        Number(currentItems[0]?.unitPrice || 0) === 0 &&
        Number(currentItems[0]?.unitVat || 0) === 0);

    if (mappedItems.length === 0) {
      message.info("해당 주문에 복사할 항목이 없습니다.");
      return;
    }

    if (isEmptyInitial) {
      setAndRecalc(mappedItems);
    } else {
      Modal.confirm({
        title: "주문 항목 복사",
        icon: <ExclamationCircleOutlined />,
        content: "기존 판매 항목이 있습니다. 주문 항목으로 교체하시겠습니까? (취소 시 추가됩니다)",
        okText: "교체",
        cancelText: "추가",
        onOk: () => setAndRecalc(mappedItems),
        onCancel: () => setAndRecalc([...currentItems, ...mappedItems]),
      });
    }
  };

  const salesItemColumns = (remove) => [
    {
      title: "No.",
      key: "index",
      width: "6%",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "품목명",
      dataIndex: "itemName",
      key: "itemName",
      align: "center",
      width: "25%",
      render: (_, field) => (
        <Form.Item
          name={[field.name, "itemName"]}
          style={{ marginBottom: 0 }}
          rules={[{ required: true, message: "품목명을 입력하세요." }]}
        >
          <Input placeholder="품목명" />
        </Form.Item>
      ),
    },
    {
      title: "단가",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "center",
      width: "15%",
      render: (_, field) => (
        <Form.Item
          name={[field.name, "unitPrice"]}
          style={{ marginBottom: 0 }}
          rules={[{ required: true, type: "number", min: 0, message: "0 이상" }]}
        >
          <InputNumber
            style={{ width: "100%", textAlign: "right" }}
            placeholder="공급가액"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      ),
    },
    {
      title: "부가세",
      dataIndex: "unitVat",
      key: "unitVat",
      align: "center",
      width: "15%",
      render: (_, field) => (
        <Form.Item
          name={[field.name, "unitVat"]}
          style={{ marginBottom: 0 }}
          rules={[{ required: true, type: "number", min: 0, message: "0 이상" }]}
        >
          <InputNumber
            style={{ width: "100%", textAlign: "right" }}
            placeholder="부가세액"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      ),
    },
    {
      title: "수량",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: "10%",
      render: (_, field) => (
        <Form.Item
          name={[field.name, "quantity"]}
          style={{ marginBottom: 0 }}
          rules={[{ required: true, type: "number", min: 1, message: "1 이상" }]}
        >
          <InputNumber style={{ width: "100%", textAlign: "right" }} placeholder="수량" />
        </Form.Item>
      ),
    },
    {
      title: "금액",
      key: "lineTotal",
      align: "center",
      width: "15%",
      render: (_, field) => {
        const q = Number(form.getFieldValue(["salesItems", field.name, "quantity"]) || 0);
        const p = Number(form.getFieldValue(["salesItems", field.name, "unitPrice"]) || 0);
        const v = Number(form.getFieldValue(["salesItems", field.name, "unitVat"]) || 0);
        const t = q * (p + v);
        return <div style={{ textAlign: "right", paddingRight: 11 }}>{t.toLocaleString("ko-KR")}</div>;
      },
    },
    {
      title: "비고",
      dataIndex: "itemNote",
      key: "itemNote",
      align: "center",
      width: "12%",
      render: (_, field) => (
        <Form.Item name={[field.name, "itemNote"]} style={{ marginBottom: 0 }}>
          <Input placeholder="비고" />
        </Form.Item>
      ),
    },
    {
      title: " ",
      key: "action",
      align: "center",
      width: "6%",
      render: (_, field, index) =>
        index === 0 ? null : (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(field.name)}
          />
        ),
    },
  ];

  return (
    <Modal
      title={isEditing ? "판매 상세 및 수정" : "신규 판매 등록"}
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
              <Form.Item name="salesId" label="판매번호">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="salesDate" label="판매일자" rules={[{ required: true, message: "매출일자를 선택하세요." }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="deploymentDate" label="출시일">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="orderId" label="주문번호">
                <Input
                  placeholder="직접 입력 또는 검색"
                  addonAfter={
                    <Button
                      icon={<SearchOutlined />}
                      style={{ background: "none", border: "none", padding: 0 }}
                      onClick={() => setIsOrderModalOpen(true)}
                    />
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="clientId" label="사업자번호">
                <Input
                  placeholder="직접 입력 또는 검색"
                  addonAfter={
                    <Button
                      icon={<SearchOutlined />}
                      style={{ background: "none", border: "none", padding: 0 }}
                      onClick={() => setIsClientModalOpen(true)}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="clientCompany" label="거래처명">
                <Input placeholder="자동 입력 또는 직접 입력" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="projectId" label="프로젝트 번호">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="projectName" label="프로젝트명">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="판매 합계">
                <InputNumber
                  value={totalSalesAmount}
                  readOnly
                  style={{ width: "100%", textAlign: "right", fontWeight: "bold" }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={6}></Col>
            <Col span={6}>
              <Form.Item name="invoiceIssued" label="세금계산서 발행" valuePropName="checked">
                <Switch checkedChildren="발행" unCheckedChildren="미발행" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="salesNote" label="매출 비고">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Typography.Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            매출 항목
          </Typography.Title>

          <Form.List name="salesItems">
            {(fields, { add, remove }) => (
              <>
                <Table
                  dataSource={fields}
                  columns={salesItemColumns(remove)}
                  rowKey={(f) => f.key}
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

          <div style={{ textAlign: "right", marginTop: 20 }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              취소
            </Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "수정" : "등록"}
            </Button>
          </div>
        </Form>
      </Spin>

      <ClientSearchModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={(client) => {
          form.setFieldsValue({
            clientId: client.clientId,
            clientCompany: client.clientCompany,
          });
          setIsClientModalOpen(false);
        }}
      />

      <OrderSearchModal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSelectOrder={(detail) => {
          handleSelectOrder(detail);
          setIsOrderModalOpen(false);
        }}
      />
    </Modal>
  );
};

export default SalesModal;