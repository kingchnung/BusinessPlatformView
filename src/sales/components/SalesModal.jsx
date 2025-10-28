import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Modal, Form, Input, Button, message, Row, Col,
  DatePicker, InputNumber, Typography, Table, Switch, Spin, Divider
} from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import { NOTO_SANS_KR_BASE64 } from "../../fonts/NotoSansKR-Variable.base64.js"; // ← 경로/파일명은 너의 생성 위치에 맞춰 유지
import { getSales, registerSales, modifySales } from "../../api/sales/salesApi";
import ClientSearchModal from "./ClientModal.jsx"
import OrderSearchModal from "./OrderModal.jsx"

const { Title, Text } = Typography;

const toBool = (v) =>
  v === true || v === 1 || v === "1" || v === "Y" || v === "y" || v === "true" || v === "TRUE";

const currency = (n) => (Number(n || 0)).toLocaleString("ko-KR");

const SalesModal = ({ open, onClose, salesData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!salesData?.salesId;

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // ⬇️ 거래명세서 출력용 숨김 DOM
  const printRef = useRef(null);

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
            orderId:
              detail.orderId ??
              detail.order?.orderId ??
              salesData?.orderId ??
              "",
            clientId: detail.clientId ?? detail.client?.clientId ?? "",
            clientCompany: detail.clientCompany ?? detail.client?.clientCompany ?? "",
            projectId: detail.projectId ?? detail.project?.projectId ?? "",
            projectName: detail.projectName ?? detail.project?.projectName ?? "",
            invoiceIssued: toBool(detail.invoiceIssued ?? detail.issued),
            salesNote: detail.salesNote ?? "",
            salesItems: (detail.salesItems || []).map((it) => ({
              ...it,
              quantity: Number(it.quantity || 0),
              unitPrice: Number(it.unitPrice || 0),
              unitVat: Number(it.unitVat || 0),
            })),
          };

          form.setFieldsValue(formData);
          setTimeout(recalcTotal, 0);
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
          salesNote: "",
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

  // ⬇️ 출력에 사용할 계산 값들
  const printData = useMemo(() => {
    const v = form.getFieldsValue(true);
    const items = (v.salesItems || []).map((it) => ({
      ...it,
      lineSupply: Number(it.quantity || 0) * Number(it.unitPrice || 0),
      lineVat: Number(it.quantity || 0) * Number(it.unitVat || 0),
      lineTotal: Number(it.quantity || 0) * (Number(it.unitPrice || 0) + Number(it.unitVat || 0)),
    }));
    const supplySum = items.reduce((a, c) => a + c.lineSupply, 0);
    const vatSum = items.reduce((a, c) => a + c.lineVat, 0);
    const totalSum = items.reduce((a, c) => a + c.lineTotal, 0);
    return { header: v, items, supplySum, vatSum, totalSum };
  }, [form, totalSalesAmount]);

  // ⬇️ 거래명세서 PDF 생성
  const handleExportSlipPDF = async () => {
    try {
      const node = printRef.current;
      if (!node) return;

      // 먼저 jsPDF 초기화 + 한글 폰트 등록
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addFileToVFS("NotoSansKR-VariableFont_wght.ttf", NOTO_SANS_KR_BASE64);
      pdf.addFont("NotoSansKR-VariableFont_wght.ttf", "NotoSansKR", "normal");
      pdf.setFont("NotoSansKR", "normal");

      // 헤더(벡터 텍스트)
      const marginX = 12, marginY = 10;
      // pdf.setFontSize(16);
      // pdf.text("거래명세서", marginX, marginY + 6);
      // pdf.setFontSize(10);
      // pdf.text(`판매번호: ${printData.header.salesId || ""}`, marginX, marginY + 12);
      // pdf.text(`거래일자: ${printData.header.salesDate ? dayjs(printData.header.salesDate).format("YYYY-MM-DD") : ""}`, marginX, marginY + 18);

      // 본문(숨김 영역) 캡처
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - marginX * 2;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = marginY + 22;
      let remainingHeight = imgHeight;
      let sourceY = 0;
      const pageUsableHeight = pageHeight - position - marginY;

      while (remainingHeight > 0) {
        const sliceHeightPx = (pageUsableHeight * canvas.width) / imgWidth;
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - sourceY);
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        const sliceImgHeightMm = (sliceCanvas.height * imgWidth) / canvas.width;
        pdf.addImage(sliceImgData, "PNG", marginX, position, imgWidth, sliceImgHeightMm, undefined, "FAST");

        sourceY += sliceCanvas.height;
        remainingHeight -= sliceImgHeightMm;

        if (remainingHeight > 0) {
          pdf.addPage();
          pdf.setFont("NotoSansKR", "normal"); // 새 페이지에서도 폰트 유지
          pdf.setFontSize(10);
          pdf.text(`거래명세서 (${printData.header.clientCompany || ""})`, marginX, marginY + 6);
          position = marginY + 10;
        }
      }

      const fileName = `${printData.header.clientCompany || "거래처"}_${printData.header.salesId || "판매"}_거래명세서_${dayjs().format("YYYYMMDD")}.pdf`
        .replace(/[\\/:*?"<>|]/g, "_");
      pdf.save(fileName);
    } catch (e) {
      console.error(e);
      message.error("거래명세서 PDF 생성 중 오류가 발생했습니다.");
    }
  };

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
            <Button onClick={handleExportSlipPDF} style={{ marginRight: 8 }}>
              거래명세서 PDF 
            </Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "수정" : "등록"}
            </Button>
          </div>
        </Form>
      </Spin>

      {/* 거래처/주문 검색 모달 */}
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

      {/* ⬇️ 거래명세서 캡처용 숨김 출력 레이아웃 */}
      <div style={{ position: "fixed", left: -99999, top: 0 }}>
        <div ref={printRef} style={{ width: 794, background: "#fff", padding: 16 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>거래명세서</h2>
          {/* ───── 상단: 좌측 회사정보 / 우측 서명란 ───── */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  }}
>
  {/* 좌측: 회사(공급자) 정보 */}
  <div style={{ flex: "0 0 60%", fontSize: 11, lineHeight: 1.7 }}>
    <div><b>공급자 상호</b>: 비즈메이트</div>
    <div><b>사업자번호</b>: 132-86-158471</div>
    <div><b>주소</b>: 서울특별시 중구 남대문로 120</div>
    <div><b>대표자</b>: 왕찬웅</div>
  </div>

  {/* 우측: 서명란 */}
  <div style={{ flex: "0 0 38%", textAlign: "center" }}>
    <div
      style={{
        border: "1px solid #999",
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
      }}
    >
      서명(인)
    </div>
    <div style={{ fontSize: 10, marginTop: 6, color: "#666" }}>
      서명 또는 직인
    </div>
  </div>
</div>

          <div style={{ fontSize: 12, marginBottom: 12 }}>
            <div>거래처: {printData.header.clientCompany || ""} ({printData.header.clientId || ""})</div>
            <div>프로젝트: {printData.header.projectName || ""} {printData.header.projectId ? `(${printData.header.projectId})` : ""}</div>
            <div>판매번호: {printData.header.salesId || ""} · 거래일자: {printData.header.salesDate ? dayjs(printData.header.salesDate).format("YYYY-MM-DD") : ""}</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={th}>품목명</th>
                <th style={th}>수량</th>
                <th style={th}>단가(공급)</th>
                <th style={th}>부가세</th>
                <th style={th}>금액</th>
                <th style={th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {printData.items.length === 0 ? (
                <tr><td style={tdCenter} colSpan={6}>항목 없음</td></tr>
              ) : (
                printData.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={td}>{it.itemName || ""}</td>
                    <td style={tdRight}>{currency(it.quantity)}</td>
                    <td style={tdRight}>{currency(it.unitPrice)}</td>
                    <td style={tdRight}>{currency(it.unitVat)}</td>
                    <td style={tdRight}>{currency(it.lineTotal)}</td>
                    <td style={td}>{it.itemNote || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ ...tdRight, fontWeight: 600 }} colSpan={2}>합계</td>
                <td style={{ ...tdRight, fontWeight: 600 }}>{currency(printData.supplySum)}</td>
                <td style={{ ...tdRight, fontWeight: 600 }}>{currency(printData.vatSum)}</td>
                <td style={{ ...tdRight, fontWeight: 600 }}>{currency(printData.totalSum)}</td>
                <td style={td}></td>
              </tr>
            </tfoot>
          </table>

          {printData.header.salesNote ? (
            <>
              <Divider />
              <div style={{ fontSize: 11 }}>비고: {printData.header.salesNote}</div>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

// 인쇄용 테이블 스타일
const border = "1px solid #999";
const th = { border, padding: "6px 8px", background: "#f5f5f5", textAlign: "center" };
const td = { border, padding: "6px 8px", verticalAlign: "top" };
const tdCenter = { ...td, textAlign: "center" };
const tdRight = { ...td, textAlign: "right", whiteSpace: "nowrap" };

export default SalesModal;
