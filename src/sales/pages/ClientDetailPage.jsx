import { useParams } from "react-router-dom";
import ClientDetail from "../components/ClientDetail";
import MainLayout from "../../layouts/MainLayout";

const ClientDetailPage = () => {
  // 1. URL 파라미터에서 :clientNo 값을 추출합니다.
  const { clientNo } = useParams();

  return (
    <MainLayout>
      {/* 2. 추출한 clientNo를 ClientDetail 컴포넌트에 prop으로 전달합니다. */}
      <ClientDetail clientNo={clientNo} />
    </MainLayout>
  );
};

export default ClientDetailPage;