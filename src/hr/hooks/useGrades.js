import { useState, useEffect } from 'react';
import axiosInstance from '../../common/axiosInstance';

export const useGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axiosInstance.get('/grades'); // 직급 목록 API 경로
        setGrades(response.data || []);
      } catch (err) {
        console.error("직급 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  return { grades, loading };
};