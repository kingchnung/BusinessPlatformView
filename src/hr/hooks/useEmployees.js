import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../common/axiosInstance';

/**
 * 🪝 useEmployees 커스텀 훅
 * 서버에서 모든 직원 데이터를 가져옵니다.
 *
 * @returns {{
 * employees: object[],   // 직원 데이터 배열
 * loading: boolean,      // 데이터 로딩 상태
 * error: object | null   // 에러 객체
 * }}
 */
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 1. 데이터 조회 로직을 별도의 함수로 분리합니다.
  const fetchEmployees = useCallback(async () => {
    setLoading(true); // 데이터 요청 시작 시 로딩 상태로 설정
    try {
      const response = await axiosInstance.get('/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error("직원 데이터 로드 실패:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열이 비어있으므로 함수는 한 번만 생성됩니다.

  // 컴포넌트가 처음 마운트될 때 한 번만 데이터를 불러옵니다.
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ✅ 2. 반환 객체에 refetch 함수를 추가합니다.
  // 이 함수는 외부에서 fetchEmployees를 다시 호출하는 역할을 합니다.
  return { employees, loading, error, refetchEmployees: fetchEmployees };

};