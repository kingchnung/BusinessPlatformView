import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Table, message, Card, Spin, Button, Space, Modal, Row, Col, Select, Pagination, Statistic } from "antd";
import { getSalesTargetList } from "../../api/sales/salesTargetApi";
import { fetchSalesTargets, deleteSalesTarget, deleteMultipleSalesTargets, setSelectedYear, clearTargetError, setSelectedKeys} from '../slice/salesTargetSlice';
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import SalesTargetModal from "../components/SalesTargetModal";
import { getHistory } from '../../api/historyApi';

const { Option } = Select;

const SalesTargetPage = () => {
  const dispatch = useDispatch();
  const [yearTotal, setYearTotal] = useState(0); 

  const {
    list: targets,
    pagination: targetPagination, 
    selectedYear,
    selectedKeys: selectedTargetKeys,
    loading: targetLoading,
    error: targetError
  } = useSelector((state) => state.salesTarget);


  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false); 
  const [editingTarget, setEditingTarget] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTargetId, setDeletingTargetId] = useState(null); 
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= currentYear - 5; i--) {
      years.push(<Option key={i} value={i}>{i}년</Option>);
    }
    return years;
  };

  const loadYearTotal = async (year = selectedYear) => {
    try {
      const res = await getSalesTargetList(1, 999, year); // 전량 조회
      const sum = (res?.dtoList || []).reduce(
        (acc, cur) => acc + (Number(cur.targetAmount) || 0),
        0
      );
      setYearTotal(sum);
    } catch (e) {
      // 조용히 실패 처리(토스트는 과함)
      setYearTotal(0);
    }
  };


  const loadTargets = (page = targetPagination.current, size = targetPagination.pageSize, year = selectedYear) => {
    dispatch(fetchSalesTargets({ page, size, year }));
  };

 
  useEffect(() => {
    loadTargets(1, targetPagination.pageSize, selectedYear);
    loadYearTotal(selectedYear);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  useEffect(() => {
    if (targetError) {
      const errorMsg = targetError.message || "매출 목표 관련 작업 중 오류가 발생했습니다.";
      message.error(errorMsg);
      // dispatch(clearTargetError());
    }
  }, [targetError, dispatch]);


 const handlePaginationChange = (page, pageSize) => {
   loadTargets(page, pageSize, selectedYear);
};


  const handleYearChange = (value) => {
    dispatch(setSelectedYear(value));
    loadTargets(1, targetPagination.pageSize, value);
    loadYearTotal(value);
  };


  const showTargetModal = (target = null) => { setIsTargetModalOpen(true); setEditingTarget(target); };
  const handleTargetModalClose = () => { setIsTargetModalOpen(false); setEditingTarget(null); };
  

 const showDeleteConfirmModal = (targetId = null) => {
    console.log("Opening delete confirm modal. targetId:", targetId);
    if (targetId) {
      setDeletingTargetId(targetId);
      setIsDeletingMultiple(false);
    } else {
      setDeletingTargetId(null);
      setIsDeletingMultiple(true);
    }
    setIsDeleteConfirmOpen(true);
  };

  
  const handleDeleteConfirmClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingTargetId(null);
    setIsDeletingMultiple(false);
    setIsDeleting(false);
  };

  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isDeletingMultiple) {
        console.log("Attempting dispatch(deleteMultipleSalesTargets)... Keys:", selectedTargetKeys);
        await dispatch(deleteMultipleSalesTargets(selectedTargetKeys)).unwrap();
        message.success("선택된 매출 목표들이 삭제되었습니다.");
      } else if (deletingTargetId) {
        console.log("Attempting dispatch(deleteSalesTarget)... ID:", deletingTargetId);
        await dispatch(deleteSalesTarget(deletingTargetId)).unwrap();
        message.success("삭제되었습니다.");
      }
      loadTargets(targetPagination.current, targetPagination.pageSize, selectedYear); // 현재 페이지/연도 기준 리로드
      loadYearTotal(selectedYear);
      handleDeleteConfirmClose();
    } catch (rejectedValueOrSerializedError) {
      console.error("Delete failed:", rejectedValueOrSerializedError);
      const errorMsg = rejectedValueOrSerializedError?.message || "삭제 처리 중 오류 발생";
      message.error(errorMsg);
      setIsDeleting(false);
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedTargetKeys, 
    onChange: (keys) => {
      dispatch(setSelectedKeys(keys));
    },
  };


  const columns = [
    {
      title: "목표 ID",
      dataIndex: "targetId",
      key: "targetId",
      align: "center",
      width: "10%",
     render: (text, record) => <a onClick={() => showTargetModal(record)}>{text}</a>,
    },
    { title: "등록일", dataIndex: "registrationDate", key: "registrationDate", align: "center", width: "15%" },
    { title: "목표 연도", dataIndex: "targetYear", key: "targetYear", align: "center", width: "10%", render: (text) => `${text}년` },
    { title: "목표 월", dataIndex: "targetMonth", key: "targetMonth", align: "center", width: "10%", render: (text) => `${text}월` },
    {
      title: "목표 금액",
      dataIndex: "targetAmount",
      key: "targetAmount",
      align: "center",
      width: "20%",
      render: (amount) => amount ? `${amount.toLocaleString('ko-KR')} 원` : '-',
    },
    { title: "담당자", dataIndex: "writer", key: "writer", align: "center", width: "15%" },
    {
      title: " ",
      key: "actions",
      align: "center",
      width: "10%",
      render: (_, record) => (
          <Button size="small" danger onClick={() => showDeleteConfirmModal(record.targetId)}>삭제</Button>
      ),
    },
  ];


  const hasSelected = selectedTargetKeys.length > 0;


  return (
    <MainLayout>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>매출 목표 관리</h2>
      
 <Card style={{ marginBottom: 20 }}>
   <Row align="middle" justify="space-between" gutter={16}>
     {/* 왼쪽: 연도 셀렉트 */}
     <Col flex="auto">
      <Space>
         <Select
           value={selectedYear}
           style={{ width: 120 }}
           onChange={handleYearChange}
         >
           {generateYearOptions()}
         </Select>
       </Space>
     </Col>

     {/* 오른쪽: 버튼들 + 목표액 카드 (한 줄로 붙이기) */}
     <Col flex="none">
       <Space align="center" size="middle" wrap>
         <Space>
           <Button
             danger
             onClick={() => showDeleteConfirmModal()}
             disabled={!hasSelected}
           >
             선택 삭제
           </Button>
           <Button onClick={() => showTargetModal()} icon={<PlusOutlined />}>
             신규 목표 등록
           </Button>
         </Space>

         <div
           style={{
             minWidth: 320,
             padding: 12,
             border: "1px solid #f0f0f0",
             borderRadius: 8,
             background: "#fff",
            textAlign: "right",
           }}
         >
           <Statistic
             title={`${selectedYear}년 연간 목표액`}
             value={yearTotal}
             precision={0}
             formatter={(v) => `${Number(v).toLocaleString("ko-KR")} 원`}
           />
         </div>
       </Space>
     </Col>
   </Row>
 </Card>

      <Spin spinning={targetLoading} tip="로딩 중...">
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.targetId}
          dataSource={targets}
          columns={columns}
          pagination={false}             
        />

         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            { targets.length > 0 &&
                <Pagination
                    current={targetPagination.current}
                    pageSize={targetPagination.pageSize}
                    total={targetPagination.total}
                    onChange={handlePaginationChange} 
                    onShowSizeChange={(page, pageSize) => loadTargets(1, pageSize, selectedYear)}
                    showSizeChanger
                    pageSizeOptions={['10','20','50']}
                />
             }
        </div>
      </Spin>

      <SalesTargetModal
        open={isTargetModalOpen}
        onClose={handleTargetModalClose} 
        targetData={editingTarget}
        onRefresh={() => {
        loadTargets(targetPagination.current, targetPagination.pageSize, selectedYear);
        loadYearTotal(selectedYear);
        }}
      />

      <Modal
        title={ <><ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} /> 삭제 확인</> }
        open={isDeleteConfirmOpen}
        onCancel={handleDeleteConfirmClose}
        footer={[
          <Button key="cancel" onClick={handleDeleteConfirmClose} disabled={isDeleting}>취소</Button>,
          <Button key="delete" type="primary" danger loading={isDeleting} onClick={handleDelete}>삭제</Button>,
        ]}
      >
        <p>
          {isDeletingMultiple
            ? `${selectedTargetKeys.length}개의 매출 목표를 정말로 삭제하시겠습니까?`
            : `매출 목표 (ID: ${deletingTargetId})(을)를 정말로 삭제하시겠습니까?`}
        </p>
        <p style={{ color: 'grey' }}>삭제된 데이터는 복구할 수 없습니다.</p>
      </Modal>

    </MainLayout>
  );
};

export default SalesTargetPage;