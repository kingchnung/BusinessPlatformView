import React, { useEffect, useState, useMemo, useRef } from "react";
import { Modal, Tabs, Table, Spin, Empty, message, Typography, Button, Divider } from "antd";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import { NOTO_SANS_KR_BASE64 } from "../../fonts/NotoSansKR-Variable.base64.js";
import html2canvas from "html2canvas";
import { listSalesByClient } from "../../api/sales/salesApi";
import { listCollectionsByClient } from "../../api/sales/collectionApi";

const { Title, Text } = Typography;

// 표 컬럼
const salesLedgerColumns = [
  { title: "판매번호", dataIndex: "salesId", key: "salesId", width: 150, align: "center" },
  {
    title: "판매일자",
    dataIndex: "salesDate",
    key: "salesDate",
    align: "center",
    width: 120,
    render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
  },
  { title: "프로젝트명", dataIndex: "projectName", key: "projectName", align: "center" },
  {
    title: "판매금액",
    dataIndex: "salesAmount",
    key: "salesAmount",
    align: "center",
    width: 150,
    render: (v) => (v ? Number(v).toLocaleString("ko-KR") : "0"),
  },
  { title: "비고", dataIndex: "salesNote", key: "salesNote", width: "40%" },
];

const collectionLedgerColumns = [
  { title: "수금번호", dataIndex: "collectionId", key: "collectionId", width: 150, align: "center" },
  {
    title: "수금일자",
    dataIndex: "collectionDate",
    key: "collectionDate",
    align: "center",
    width: 120,
    render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "수금액",
    dataIndex: "collectionMoney",
    key: "collectionMoney",
    align: "center",
    width: 150,
    render: (v) => (v ? Number(v).toLocaleString("ko-KR") : "0"),
  },
  { title: "비고", dataIndex: "collectionNote", key: "collectionNote" },
];

const currency = (n) => (n ? Number(n).toLocaleString("ko-KR") : "0");

const ClientLedgerModal = ({ open, onClose, client }) => {
  const [loading, setLoading] = useState(false);
  const [salesList, setSalesList] = useState([]);
  const [collectionList, setCollectionList] = useState([]);

  const clientId = client?.clientId;
  const clientCompany = client?.clientCompany;

  // 출력용 ref (숨김 영역)
  const printRef = useRef(null);

  useEffect(() => {
    if (open && clientId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [salesData, collectionData] = await Promise.all([
            listSalesByClient(clientId),
            listCollectionsByClient(clientId),
          ]);
          setSalesList(salesData || []);
          setCollectionList(collectionData || []);
        } catch (error) {
          message.error("거래처 내역을 불러오는 중 오류가 발생했습니다.");
          setSalesList([]);
          setCollectionList([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (!open) {
      setSalesList([]);
      setCollectionList([]);
    }
  }, [open, clientId]);

  // 합계
  const totals = useMemo(() => {
    const salesSum = salesList.reduce((acc, cur) => acc + Number(cur.salesAmount || 0), 0);
    const collSum = collectionList.reduce((acc, cur) => acc + Number(cur.collectionMoney || 0), 0);
    return {
      salesSum,
      collSum,
      outstanding: salesSum - collSum,
    };
  }, [salesList, collectionList]);

  // PDF 내보내기
  const handleExportPDF = async () => {
    try {
      // 숨김 출력영역을 캡처 (안티디 디자인 테이블 그대로)
      const node = printRef.current;
      if (!node) return;

      // 캡처 품질 향상(scale), 스크롤 포함
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addFileToVFS("NotoSansKR-VariableFont_wght.ttf", NOTO_SANS_KR_BASE64);
      pdf.addFont("NotoSansKR-VariableFont_wght.ttf", "NotoSansKR", "normal");
      pdf.setFont("NotoSansKR", "normal");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 상단 여백을 두고 이미지 폭 계산
      const marginX = 10;
      const marginY = 10;
      const usableWidth = pageWidth - marginX * 2;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = marginY + 20; // 헤더 텍스트 아래부터 시작
      let remainingHeight = imgHeight;

      // 헤더(텍스트)는 벡터로 추가 → 선명
      pdf.setFontSize(14);
      pdf.text(`거래처 원장`, marginX, marginY + 6);
      pdf.setFontSize(10);
      pdf.text(`거래처: ${clientCompany || ""} (${clientId || ""})`, marginX, marginY + 12);
      pdf.text(`출력일: ${dayjs().format("YYYY-MM-DD HH:mm")}`, marginX, marginY + 18);

      // 이미지가 한 페이지에 안 들어가면 잘라서 여러 페이지에 추가
      let sourceY = 0;
      const pageUsableHeight = pageHeight - position - marginY;

      while (remainingHeight > 0) {
        const sliceHeightPx = (pageUsableHeight * canvas.width) / imgWidth; // 페이지에 들어갈 캔버스 픽셀 높이
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - sourceY);

        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        const sliceImgHeightMm = (sliceCanvas.height * imgWidth) / canvas.width;

        pdf.addImage(sliceImgData, "PNG", marginX, position, imgWidth, sliceImgHeightMm, undefined, "FAST");

        sourceY += sliceCanvas.height;
        remainingHeight -= sliceImgHeightMm;

        if (remainingHeight > 0) {
          pdf.addPage();
          // 다음 페이지 상단 헤더(간단한 페이지 표기)
          pdf.setFont("NotoSansKR", "normal"); 
          pdf.setFontSize(10);
          pdf.text(`거래처 원장 - ${clientCompany || ""} (${clientId || ""})`, marginX, marginY + 6);
          position = marginY + 10;
        }
      }

      // 파일명: [사업자번호]_[거래처]_원장_YYYYMMDD.pdf
      const fileName = `${clientId || "CLIENT"}_${clientCompany || "거래처"}_원장_${dayjs().format(
        "YYYYMMDD"
      )}.pdf`.replace(/[\\/:*?"<>|]/g, "_");

      pdf.save(fileName);
    } catch (e) {
      console.error(e);
      message.error("PDF 생성 중 오류가 발생했습니다.");
    }
  };

  const tabsItems = [
    {
      key: "sales",
      label: `매출 내역 (${salesList.length}건)`,
      children: (
        <Table
          rowKey="salesId"
          columns={salesLedgerColumns}
          dataSource={salesList}
          pagination={false}
          size="small"
          bordered
          scroll={{ y: 400 }}
        />
      ),
    },
    {
      key: "collection",
      label: `수금 내역 (${collectionList.length}건)`,
      children: (
        <Table
          rowKey="collectionId"
          columns={collectionLedgerColumns}
          dataSource={collectionList}
          pagination={false}
          size="small"
          bordered
          scroll={{ y: 400 }}
        />
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`거래처 원장: ${clientCompany || ""} (${clientId || ""})`}
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="pdf" onClick={handleExportPDF}>PDF 내보내기</Button>,
          <Button key="close" type="primary" onClick={onClose}>닫기</Button>,
        ]}
        width={1000}
        destroyOnClose
      >
        <Spin spinning={loading} tip="데이터 조회 중...">
          {salesList.length === 0 && collectionList.length === 0 && !loading ? (
            <Empty description="해당 거래처의 매출 또는 수금 내역이 없습니다." />
          ) : (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text>매출 합계: {currency(totals.salesSum)} 원 · 수금 합계: {currency(totals.collSum)} 원 · 미수금: <b>{currency(totals.outstanding)} 원</b></Text>
              </div>
              <Tabs defaultActiveKey="sales" items={tabsItems} />
            </>
          )}
        </Spin>
      </Modal>

      {/* ⬇️ PDF 캡처용 숨김 영역(모든 내용이 한 번에 들어가도록 구성) */}
      <div style={{ position: "fixed", left: -99999, top: 0 }}>
        <div ref={printRef} style={{ width: 794 /* A4 px 기준(96dpi 환산) 대략치 */, padding: 16, background: "#fff" }}>
          <h2 style={{ margin: 0, marginBottom: 4 }}>거래처 원장</h2>
          <div style={{ fontSize: 12, marginBottom: 12 }}>
            <div>거래처: {clientCompany || ""} ({clientId || ""})</div>
            <div>출력일: {dayjs().format("YYYY-MM-DD HH:mm")}</div>
            <div>매출 합계: {currency(totals.salesSum)} 원 · 수금 합계: {currency(totals.collSum)} 원 · 미수금: {currency(totals.outstanding)} 원</div>
          </div>

          <h3 style={{ marginTop: 8 }}>① 매출 내역 ({salesList.length}건)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={th}>판매번호</th>
                <th style={th}>판매일자</th>
                <th style={th}>프로젝트명</th>
                <th style={th}>판매금액</th>
                <th style={th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {salesList.length === 0 ? (
                <tr><td style={tdCenter} colSpan={5}>내역 없음</td></tr>
              ) : (
                salesList.map((row) => (
                  <tr key={row.salesId}>
                    <td style={tdCenter}>{row.salesId}</td>
                    <td style={tdCenter}>{row.salesDate ? dayjs(row.salesDate).format("YYYY-MM-DD") : "-"}</td>
                    <td style={td}>{row.projectName || ""}</td>
                    <td style={tdRight}>{currency(row.salesAmount)}</td>
                    <td style={td}>{row.salesNote || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Divider />

          <h3 style={{ marginTop: 8 }}>② 수금 내역 ({collectionList.length}건)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={th}>수금번호</th>
                <th style={th}>수금일자</th>
                <th style={th}>수금액</th>
                <th style={th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {collectionList.length === 0 ? (
                <tr><td style={tdCenter} colSpan={4}>내역 없음</td></tr>
              ) : (
                collectionList.map((row) => (
                  <tr key={row.collectionId}>
                    <td style={tdCenter}>{row.collectionId}</td>
                    <td style={tdCenter}>{row.collectionDate ? dayjs(row.collectionDate).format("YYYY-MM-DD") : "-"}</td>
                    <td style={tdRight}>{currency(row.collectionMoney)}</td>
                    <td style={td}>{row.collectionNote || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// 인라인 테이블 스타일
const border = "1px solid #999";
const th = { border, padding: "6px 8px", background: "#f5f5f5", textAlign: "center" };
const td = { border, padding: "6px 8px", verticalAlign: "top" };
const tdCenter = { ...td, textAlign: "center" };
const tdRight = { ...td, textAlign: "right", whiteSpace: "nowrap" };

export default ClientLedgerModal;
