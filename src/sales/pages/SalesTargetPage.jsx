import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Table, message, Card, Spin, Button, Space, Modal, Row, Col, Select } from "antd";
import {
  fetchSalesTargets,
  deleteSalesTarget,
  setSelectedYear,
  clearTargetError
} from '../slice/salesTargetSlice';
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import SalesTargetModal from "../components/SalesTargetModal";

const { confirm } = Modal;
const { Option } = Select;

const SalesTargetPage = () => {
  const dispatch = useDispatch();

  const {
    list: targets,
    pagination: targetPagination, 
    selectedYear,
    loading: targetLoading,
    error: targetError
  } = useSelector((state) => state.salesTarget);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);


  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= currentYear - 5; i--) {
      years.push(<Option key={i} value={i}>{i}년</Option>);
    }
    return years;
  };


  const loadTargets = (page = targetPagination.current, size = targetPagination.pageSize, year = selectedYear) => {
    dispatch(fetchSalesTargets({ page, size, year }));
  };

 
  useEffect(() => {
    loadTargets(1, targetPagination.pageSize, selectedYear); // 연도 변경 시 1페이지부터
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);


  useEffect(() => {
    if (targetError) {
      const errorMsg = targetError.message || "매출 목표 관련 작업 중 오류가 발생했습니다.";
      message.error(errorMsg);
      // dispatch(clearTargetError());
    }
  }, [targetError]);


  const handleTableChange = (paginationConfig) => {
    loadTargets(paginationConfig.current, paginationConfig.pageSize, selectedYear);
  };


  const handleYearChange = (value) => {
    dispatch(setSelectedYear(value));
  };


  const showModal = (target = null) => { setIsModalOpen(true); setEditingTarget(target); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingTarget(null); };

  const showDeleteConfirm = (targetId) => {
    confirm({
      title: "정말로 이 매출 목표를 삭제하시겠습니까?",
      icon: <ExclamationCircleFilled />,
      okText: "삭제", okType: "danger", cancelText: "취소",
      async onOk() {
        try {
          await dispatch(deleteSalesTarget(targetId)).unwrap();
          message.success("삭제되었습니다.");
          // 삭제 후 현재 페이지 목록 다시 로드
          loadTargets(targetPagination.current, targetPagination.pageSize, selectedYear);
        } catch (rejectedValueOrSerializedError) {
          const errorMsg = rejectedValueOrSerializedError?.message || "삭제 처리 중 오류 발생";
          message.error(errorMsg);
        }
      },
    });
  };

  const columns = [
    {
      title: "목표 ID",
      dataIndex: "targetId",
      key: "targetId",
      align: "center",
      width: "10%",
      render: (text, record) => <a onClick={() => showModal(record)}>{text}</a>,
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
      title: "관리",
      key: "actions",
      align: "center",
      width: "10%",
      render: (_, record) => (
          <Button size="small" danger onClick={() => showDeleteConfirm(record.targetId)}>삭제</Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>매출 목표 관리</h2>

      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
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
          <Col>
            <Button onClick={() => showModal()} icon={<PlusOutlined />}>
              신규 목표 등록
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={targetLoading} tip="로딩 중...">
        <Table
          rowKey={(record) => record.targetId}
          dataSource={targets}
          columns={columns}
          pagination={targetPagination}
          onChange={handleTableChange}
        />
      </Spin>

      <SalesTargetModal
        open={isModalOpen}
        onClose={handleModalClose}
        targetData={editingTarget}
        onRefresh={() => loadTargets(targetPagination.current, targetPagination.pageSize, selectedYear)}
      />
    </MainLayout>
  );
};

export default SalesTargetPage;