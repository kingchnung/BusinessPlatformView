import { current } from "@reduxjs/toolkit";
import { Spin, Card, message, Table } from "antd";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

const ClientList = ({refreshKey = 0}) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const navigate = useNavigate();

    const loadClients = async (page = 1, size = 10) => {
        try {
            setLoading(true);
            const res = await getClientList(page, size);
            
            if(res && res.dtoList) {
                setClients(res.dtoList);
                setPagination({
                    current: res.pageRequestDTO.page,
                    pageSize: res.pageRequestDTO.size,
                    total: res.totalCount
                });
                console.log("거래처 리스트 로드 성공: ", res.dtoList);
            } else {
                message.warning("거래처 목록이 비어있습니다.");
            }
        } catch(error) {
            console.error("거래처 목록 조회 실패: ", error);
            message.error("거래처 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=> {
        loadClients(pagination.current, pagination.pageSize);
    }, [refreshKey]);

    const handleTableChange = (paginationConfig) => {
        loadClients(paginationConfig.current, pagination.pageSize);
    };

    const colums = [
{
    title: "사업자등록번호",
    dataIndex: "clientId",
    key: "clientId",
    align: "center",
  },
  {
    title: "거래처명",
    dataIndex: "clientCompany",
    key: "clientCompany",
    render: (text, record) => (
      <Link to={`/sales/client/${record.clientNo}`}>{text}</Link>
    ),
  },
  {
    title: "대표자",
    dataIndex: "clientCeo",
    key: "clientCeo",
    align: "center",
  },
  {
    title: "연락처",
    dataIndex: "clientContact",
    key: "clientContact",
  },
  {
    title: "등록일",
    dataIndex: "registrationDate",
    key: "registrationDate",
    align: "center",
    render: (dateString) => new Date(dateString).toLocaleDateString("ko-KR"),
  },
  {
    title: "검증 상태",
    dataIndex: "validationStatus",
    key: "validationStatus",
    align: "center",
    render: (isValidated) =>
      isValidated ? (
        <Tag color="blue">검증 완료</Tag>
      ) : (
        <Tag color="gold">검증 대기</Tag>
      ),
  },
];

return (
    <Card
        title="거래처 목록"
        style={{
            marginTop: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
        >
            <Spin spinning={loading} tip="로딩 중...">
                <Table
                    rowKey={(record) => record.clientNo}
                    dataSource={clients}
                    columns={colums}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Spin>
        </Card>
);
};

export default ClientList;