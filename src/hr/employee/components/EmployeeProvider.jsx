import { useEffect } from "react";
import axiosInstance from "../../../common/axiosInstance";

/**
 * 🤝 EmployeeProvider
 * 모든 직원 데이터를 서버에서 가져와 부모 컴포넌트로 전달하는 역할만 수행합니다.
 * '어떻게' 데이터를 사용할지는 이 컴포넌트를 사용하는 부모가 결정합니다.
 * * props:
 * onDataReady: (employees) => void // 가공되지 않은 전체 직원 배열을 전달
 */
const EmployeeProvider = ({ onDataReady }) => {
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/employees");

        // 서버에서 받은 데이터를 그대로 전달
        if (typeof onDataReady === "function") {
          onDataReady(res.data || []); 
        }
      } catch (err) {
        console.error("❌ 전체 직원 데이터 로드 실패:", err);
        // 에러 발생 시 빈 배열 전달
        if (typeof onDataReady === "function") {
          onDataReady([]);
        }
      }
    };

    fetchEmployees();
  }, [onDataReady]); // onDataReady 함수가 변경될 경우를 대비해 deps 배열에 추가

  return null; // 시각적 출력 없음
};

export default EmployeeProvider;