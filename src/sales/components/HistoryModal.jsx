// 예: HistoryModal.jsx (또는 페이지 내부)
import React, { useState } from "react";
import { Button, Modal, Table, Spin, message, Tag } from "antd";
import { getHistory } from "@/api/historyApi";

const typeLabel = (t) => {
  // 서버에서 ADD/MOD/DEL로 옴
  switch (t) {
    case "ADD": return <Tag>생성</Tag>;
    case "MOD": return <Tag>수정</Tag>;
    case "DEL": return <Tag color="red">삭제</Tag>;
    default: return t;
  }
};

const historyColumns = [
  {
    title: "수정일시",
    dataIndex: "revisionTimestamp",
    key: "revisionTimestamp",
    render: (ts) => ts ? new Date(ts).toLocaleString() : "-",
  },
  { title: "수정유형", dataIndex: "revisionType", key: "revisionType", render: typeLabel },
  { title: "수정자ID", dataIndex: "modifierId", key: "modifierId" },
  { title: "수정자명", dataIndex: "modifierName", key: "modifierName" },
  // { title: "표시명", dataIndex: "modifierFull", key: "modifierFull" }, // 필요시 노출
];

export default function HistoryButton({ domain, entityId }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const { data } = await getHistory(domain, entityId);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      message.error("이력 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={openModal}>수정이력</Button>
      <Modal
        title="수정 이력"
        open={open}
        onCancel={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>닫기</Button>}
        width={800}
      >
        <Spin spinning={loading}>
          <Table dataSource={rows} columns={historyColumns} rowKey="revisionId" />
        </Spin>
      </Modal>
    </>
  );
}
