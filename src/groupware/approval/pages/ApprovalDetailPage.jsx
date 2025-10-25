import { useParams } from "react-router-dom";
import ApprovalDetail from "../component/ApprovalDetail";
import MainLayout from "../../../layouts/MainLayout";

const ApprovalDetailPage = () => {
  const { id } = useParams();
  return (
      <ApprovalDetail docId={id} />
  
  );
};

export default ApprovalDetailPage;
