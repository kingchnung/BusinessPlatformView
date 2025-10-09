import React from "react";
import { useParams } from "react-router-dom";
import MainPage from "./MainPage";
import ApprovalDetail from "../components/approval/ApprovalDetail";

const ApprovalDetailPage = () => {
  const { id } = useParams();
  return (
    <MainPage>
      <ApprovalDetail docId={id} />
    </MainPage>
  );
};

export default ApprovalDetailPage;
