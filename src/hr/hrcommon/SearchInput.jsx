import React from 'react';
import { Input } from 'antd';

/**
 * 🎨 SearchInput 공용 컴포넌트
 * @param {string} value - 현재 검색어
 * @param {Function} onChange - 검색어가 변경될 때 호출될 함수
 * @param {object} props - 기타 antd Input.Search에 전달할 props
 */
const SearchInput = ({ value, onChange, ...props }) => {
  return (
    <Input.Search
      placeholder="이름으로 검색"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ marginBottom: 16, width: 250 }}
      allowClear
      {...props}
    />
  );
};

export default SearchInput;