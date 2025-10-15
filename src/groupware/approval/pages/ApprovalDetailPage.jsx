import { useParams } from "react-router-dom";
import ApprovalDetail from "../component/ApprovalDetail";
import MainLayout from "../../../layouts/MainLayout";

const ApprovalDetailPage = () => {
  const { id } = useParams();
  return (
    <MainLayout>
      <ApprovalDetail docId={id} />
    </MainLayout>
  );
};

export default ApprovalDetailPage;
