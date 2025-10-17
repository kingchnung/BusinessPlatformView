import { useState, useEffect } from 'react';
import axiosInstance from '../../common/axiosInstance'; // 설정해둔 axios 인스턴스

/**
 * 🪝 useDepartments 커스텀 훅
 * 서버에서 모든 부서/팀 데이터를 가져옵니다.
 *
 * @returns {{
 * departments: object[],  // 부서/팀 데이터 배열
 * loading: boolean,       // 데이터 로딩 상태
 * error: object | null    // 에러 객체
 * }}
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/departments');
        setDepartments(response.data || []);
      } catch (err) {
        console.error("부서 데이터 로드 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []); // 빈 배열을 전달하여 최초 1회만 실행

  return { departments, loading, error };
};