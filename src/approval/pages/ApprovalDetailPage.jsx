import React from "react";
import { useParams } from "react-router-dom";
import MainPage from "../../pages/MainPage";
import ApprovalDetail from "../component/ApprovalDetail";

const ApprovalDetailPage = () => {
  const { id } = useParams();
  return (
    <MainPage>
      <ApprovalDetail docId={id} />
    </MainPage>
  );
};

export default ApprovalDetailPage;
