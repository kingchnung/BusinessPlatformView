import React, { useState } from "react";
import MainPage from "../../pages/MainPage";
import ApprovalForm from "../component/ApprovalForm";
import ApprovalList from "../component/ApprovalList";
import { Row, Col } from "antd";

const ApprovalDraftPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainPage>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <ApprovalForm onUpdate={handleUpdate} />
        </Col>
        <Col span={24}>
          <ApprovalList refreshKey={refreshKey} />
        </Col>
      </Row>
    </MainPage>
  );
};

export default ApprovalDraftPage;