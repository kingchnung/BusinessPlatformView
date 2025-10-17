import React, { useState, useEffect } from "react";
import { getClient, removeClient } from "../../api/sales/clientApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // 👈 [1] useSelector 다시 추가

const ClientDetail = ({ clientNo }) => {
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  // 👈 [2] Redux store에서 사용자 정보 가져오기 (로그인 상태 확인용)
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    getClient(clientNo)
      .then((data) => {
        setClient(data);
      })
      .catch((error) => {
        console.error("거래처 정보를 불러오는데 실패했습니다.", error);
      });
  }, [clientNo]);

  const handleDelete = () => {
    if (window.confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
      removeClient(clientNo)
        .then(() => {
          alert("거래처가 삭제되었습니다.");
          navigate("/sales/client/list");
        })
        .catch((error) => {
          console.error("삭제 실패:", error);
          alert("거래처 삭제에 실패했습니다.");
        });
    }
  };

  const handleModify = () => {
    navigate(`/sales/client/modify/${clientNo}`);
  };

  if (!client) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5 shadow-lg rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">거래처 상세 정보</h2>

      {/* ... (거래처 정보 표시 부분은 동일) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... */}
        <div className="font-semibold text-gray-600">담당자:</div>
        <div>{client.writer} ({client.userId})</div>
        {/* ... */}
      </div>

      <div className="flex justify-end mt-8 space-x-2">
        {/* 👇 [3] currentUser 객체가 존재할 때만 (로그인 상태일 때만) 버튼을 보여줌 */}
        {currentUser && (
          <>
            <button
              onClick={handleModify}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              삭제
            </button>
          </>
        )}
        <button
          onClick={() => navigate("/sales/client/list")}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          목록
        </button>
      </div>
    </div>
  );
};

export default ClientDetail;