import React, { useState } from "react";
import ApprovalForm from "../component/ApprovalForm";
import ApprovalList from "../component/ApprovalList";
import { Row, Col } from "antd";
import MainLayout from "../../../layouts/MainLayout";

const ApprovalDraftPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <ApprovalForm onUpdate={handleUpdate} />
        </Col>
        <Col span={24}>
          <ApprovalList refreshKey={refreshKey} />
        </Col>
      </Row>
  );
};

export default ApprovalDraftPage;