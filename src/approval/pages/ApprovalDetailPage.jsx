import React from "react";
import { useParams } from "react-router-dom";
import MainPage from "../../pages/MainPage";
import ApprovalDetail from "../component/ApprovalDetail";
import MainLayout from "../../layouts/MainLayout";

const ApprovalDetailPage = () => {
  const { id } = useParams();
  return (
    <MainLayout>
      <ApprovalDetail docId={id} />
    </MainLayout>
  );
};

export default ApprovalDetailPage;
