// src/pages/sales/components/OrderSearchModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal, Table, Input, Select, Row, Col, Space, Button, Pagination, Tag, message, Spin
} from "antd";
import dayjs from "dayjs";
import { getOrderList, getOrder } from "../../api/sales/orderApi";

const { Option } = Select;

const OrderSearchModal = ({ open, onClose, onSelectOrder }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 간단 검색 상태
  const [searchField, setSearchField] = useState("client"); // client | project | writer | item
  const [keyword, setKeyword] = useState("");

  const load = async (p = page, s = size) => {
    setLoading(true);
    try {
      const res = await getOrderList(p, s, searchField, keyword);
      setRows(res.dtoList || []);
      setTotal(res.totalCount || 0);
      setPage(res.pageRequestDTO?.page || p);
      setSize(res.pageRequestDTO?.size || s);
    } catch (e) {
      message.error("주문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load(1, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSearch = () => load(1, size);
  const handlePageChange = (p, s) => load(p, s);

  const columns = [
    {
      title: "주문번호",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
    },
    {
      title: "거래처명",
      dataIndex: "clientCompany",
      key: "clientCompany",
      align: "center",
    },
    {
      title: "프로젝트명",
      dataIndex: "projectName",
      key: "projectName",
      align: "center",
    },
    {
      title: "주문일자",
      dataIndex: "orderDate",
      key: "orderDate",
      align: "center",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "납기예정일",
      dataIndex: "orderDueDate",
      key: "orderDueDate",
      align: "center",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "주문금액",
      dataIndex: "orderAmount",
      key: "orderAmount",
      align: "right",
      render: (v) => (v != null ? `${Number(v).toLocaleString("ko-KR")} 원` : "-"),
    },
    {
      title: "상태",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
        let color = "default";
        if (status === "진행중") color = "blue";
        else if (status === "완료") color = "green";
        else if (status === "취소됨") color = "red";
        return <Tag color={color}>{status || "N/A"}</Tag>;
      },
    },
    {
      title: "선택",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={async () => {
            try {
              // 상세를 가져가면 SalesModal에서 바로 클라이언트/프로젝트 채우기 가능
              const detail = await getOrder(record.orderId);
              onSelectOrder?.(detail);
            } catch {
              // 실패해도 최소정보 전달
              onSelectOrder?.(record);
            }
            onClose?.();
          }}
        >
          선택
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="주문 검색"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Row gutter={12} align="middle" justify="space-between">
          <Col>
            <Space>
              <Select value={searchField} style={{ width: 120 }} onChange={setSearchField}>
                <Option value="client">거래처명</Option>
                <Option value="project">프로젝트명</Option>
                <Option value="writer">담당자명</Option>
                <Option value="item">품목명</Option>
              </Select>
              <Input
                placeholder="검색어를 입력하세요"
                style={{ width: 260 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>검색</Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            rowKey={(r) => r.orderId}
            dataSource={rows}
            columns={columns}
            pagination={false}
          />
        </Spin>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            current={page}
            pageSize={size}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50"]}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default OrderSearchModal;
