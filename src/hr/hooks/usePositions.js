import { useState, useEffect } from 'react';
import axiosInstance from '../../common/axiosInstance';

export const usePositions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axiosInstance.get('/positions'); // 직위 목록 API 경로
        setPositions(response.data || []);
      } catch (err) {
        console.error("직위 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  return { positions, loading };
};