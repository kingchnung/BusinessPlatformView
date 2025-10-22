import React, { useEffect, useState } from "react";
import { Table, message, Card, Spin, Button, Space, Modal } from "antd"; // Modal 추가
import { getClientList, removeClient } from "../../../api/sales/clientApi"; // 1. API 함수 가져오기
import { useNavigate } from "react-router-dom";
import { ExclamationCircleFilled } from "@ant-design/icons"; // 아이콘 추가

const { confirm } = Modal; // Modal.confirm 사용

const ClientList = () => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]); // 2. state 이름 변경
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();

  // ✅ 거래처 목록 불러오는 함수
  const loadClients = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getClientList(page, size);
      if (res && res.dtoList) {
        setClients(res.dtoList);
        setPagination({
          current: res.pageRequestDTO.page,
          pageSize: res.pageRequestDTO.size,
          total: res.totalCount,
        });
      }
    } catch (error) {
      message.error("거래처 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 처음 렌더링될 때 데이터 로드
  useEffect(() => {
    loadClients(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 페이지네이션 변경 시 데이터 로드
  const handleTableChange = (paginationConfig) => {
    loadClients(paginationConfig.current, paginationConfig.pageSize);
  };

  // ✅ 삭제 처리 함수
  const showDeleteConfirm = (clientNo) => {
    confirm({
      title: "정말로 이 거래처를 삭제하시겠습니까?",
      icon: <ExclamationCircleFilled />,
      content: "삭제된 데이터는 복구할 수 없습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          await removeClient(clientNo);
          message.success("거래처가 삭제되었습니다.");
          loadClients(pagination.current, pagination.pageSize); // 목록 새로고침
        } catch (error) {
          message.error("삭제 처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  // 👇 4. columns 내용을 거래처에 맞게 수정!
  const columns = [
    {
      title: "거래처 ID",
      dataIndex: "clientId",
      key: "clientId",
      align: "center",
      width: "15%",
    },
    {
      title: "거래처명",
      dataIndex: "clientCompany",
      key: "clientCompany",
      render: (text, record) => (
        <a onClick={() => navigate(`/sales/clients/${record.clientNo}`)}>
          {text}
        </a>
      ),
    },
    {
      title: "대표자",
      dataIndex: "clientCeo",
      key: "clientCeo",
      align: "center",
      width: "15%",
    },
    {
      title: "연락처",
      dataIndex: "clientContact",
      key: "clientContact",
      align: "center",
      width: "20%",
    },
    {
      title: "등록일",
      dataIndex: "registrationDate",
      key: "registrationDate",
      align: "center",
      width: "15%",
      render: (date) => (date ? new Date(date).toLocaleDateString("ko-KR") : "-"),
    },
    {
      title: "선택",
      key: "actions",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Space>
          <Button
            danger
            size="small"
            onClick={() => showDeleteConfirm(record.clientNo)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="거래처 목록"
      style={{
        marginTop: 16, // 위쪽 여백 살짝 추가
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Spin spinning={loading} tip="로딩 중...">
        <Table
          rowKey={(record) => record.clientNo}
          dataSource={clients}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Spin>
    </Card>
  );
};

export default ClientList;