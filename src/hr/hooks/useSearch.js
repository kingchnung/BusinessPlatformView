import { useState, useMemo } from 'react';

/**
 * 🪝 useSearch 커스텀 훅 (업그레이드 버전)
 *
 * @param {Array} initialData - 필터링할 원본 데이터 배열
 * @param {Array<string>} searchKeys - 객체 배열에서 검색할 속성 이름들의 배열 (예: ['empName', 'deptName'])
 * @returns {{...}}
 */
export const useSearch = (initialData, searchKeys) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    // searchKeys가 배열이 아니면 오류를 방지합니다.
    if (!Array.isArray(searchKeys)) return initialData;

    if (!searchTerm) {
      return initialData;
    }

    return initialData.filter(item => {
      // ✅ 핵심 수정: searchKeys 배열을 순회하며
      // 하나라도 검색어와 일치하는 속성이 있는지 확인합니다.
      return searchKeys.some(key =>
        item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [initialData, searchTerm, searchKeys]);

  return { searchTerm, setSearchTerm, filteredData };
};