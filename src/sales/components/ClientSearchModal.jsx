import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Table, Spin, message } from 'antd';
import { getClientList } from '../../api/sales/clientApi';

const { Search } = Input;

const ClientSearchModal = ({ open, onClose, onSelectClient }) => {
  const [loading, setLoading] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (open && allClients.length === 0) { 
      const fetchAllClients = async () => {
        setLoading(true);
        try {
          const response = await getClientList(1, 20);
          if (response && response.dtoList) {
            setAllClients(response.dtoList);
          } else {
             message.error("거래처 목록을 가져올 수 없습니다.");
             setAllClients([]); 
          }
        } catch (error) {
          message.error("거래처 목록 로딩 중 오류 발생");
          setAllClients([]); 
        } finally {
          setLoading(false);
        }
      };
      fetchAllClients();
    }

     if (!open) {
         setSearchTerm('');
     }
  }, [open]); // allClients.length === 0 조건 제거 시 모달 열릴 때마다 로드


  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return allClients; 
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return allClients.filter(client =>
      (client.clientCompany && client.clientCompany.toLowerCase().includes(lowerCaseSearch)) ||
      (client.clientId && client.clientId.replace(/-/g, '').includes(lowerCaseSearch)) || 
      (client.clientCeo && client.clientCeo.toLowerCase().includes(lowerCaseSearch))
    );
  }, [allClients, searchTerm]);


  const columns = [
    {
      title: '사업자번호',
      dataIndex: 'clientId',
      key: 'clientId',
      width: '30%',
    },
    {
      title: '거래처명',
      dataIndex: 'clientCompany',
      key: 'clientCompany',
      width: '40%',
    },
  ];


  const handleRowClick = (client) => {
    onSelectClient(client); 
    onClose();
  };

  return (
    <Modal
      title="거래처 검색"
      open={open}
      onCancel={onClose}
      footer={null} 
      width={800} 
      destroyOnClose // 닫힐 때 내부 상태 초기화 (데이터 재로딩 방지 시 제거)
    >
      <Search
        placeholder="거래처명, 사업자번호(- 제외) 검색"
        allowClear
        enterButton="검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="clientNo"
          pagination={{ pageSize: 5 }} 
          size="small"
          onRow={(record) => ({
            onClick: () => handleRowClick(record), 
            style: { cursor: 'pointer' } 
          })}
          scroll={{ y: 300 }} 
        />
      </Spin>
    </Modal>
  );
};

export default ClientSearchModal;