import React, { useEffect, useState } from "react";
import { Modal, Tabs, Table, Spin, Empty, message, Card, Typography, Button } from "antd";
import dayjs from "dayjs";
import { listSalesByClient } from "../../api/sales/salesApi";
import { listCollectionsByClient } from "../../api/sales/collectionApi";

const { Title, Text } = Typography;

// 1. 모달 내부에서 사용할 '매출' 테이블 컬럼
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
  { 
    title: "비고", 
    dataIndex: "salesNote", 
    key: "salesNote",
    width: "40%"
  },
];

// 2. 모달 내부에서 사용할 '수금' 테이블 컬럼
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

/**
 * @param {boolean} open - 모달 열림 여부
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {object} client - { clientId, clientCompany }
 */
const ClientLedgerModal = ({ open, onClose, client }) => {
  const [loading, setLoading] = useState(false);
  const [salesList, setSalesList] = useState([]);
  const [collectionList, setCollectionList] = useState([]);
  
  const clientId = client?.clientId;
  const clientCompany = client?.clientCompany;

  useEffect(() => {
    // 모달이 열릴 때, 그리고 clientId가 있을 때 데이터 조회
    if (open && clientId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // 3. 두 API를 동시에 호출
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
      // 모달이 닫히면 데이터 초기화
      setSalesList([]);
      setCollectionList([]);
    }
  }, [open, clientId]);

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
    <Modal
      title={`거래처 원장: ${clientCompany || ""} (${clientId || ""})`}
      open={open}
      onCancel={onClose}
      footer={
        <Button key="close" type="primary" onClick={onClose}>
          닫기
        </Button>
      }
      width={1000}
      destroyOnClose
    >
      <Spin spinning={loading} tip="데이터 조회 중...">
        {salesList.length === 0 && collectionList.length === 0 && !loading ? (
          <Empty description="해당 거래처의 매출 또는 수금 내역이 없습니다." />
        ) : (
          <Tabs defaultActiveKey="sales" items={tabsItems} />
        )}
      </Spin>
    </Modal>
  );
};

export default ClientLedgerModal;