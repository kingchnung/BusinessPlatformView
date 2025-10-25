import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../common/axiosInstance';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/departments');
      setDepartments(response.data || []);
    } catch (err) {
      console.error("부서 데이터 로드 실패:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { 
    departments, 
    loading, 
    error,
    refetchDepartments: fetchDepartments
  };
};
