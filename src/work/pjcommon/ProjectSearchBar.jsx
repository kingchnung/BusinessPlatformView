import { Input, Select, Row, Col, Button } from "antd";
import { useState } from "react";

const ProjectSearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    deptId: "",
  });

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Input
          placeholder="프로젝트명 또는 PM 검색"
          value={filters.keyword}
          onChange={(e) => handleChange("keyword", e.target.value)}
        />
      </Col>

      <Col xs={24} sm={12} md={5}>
        <Select
          placeholder="상태 선택"
          value={filters.status}
          style={{ width: "100%" }}
          onChange={(v) => handleChange("status", v)}
          allowClear
          options={[
            { value: "", label :"전부"},
            { value: "PLANNING", label: "기획 중" },
            { value: "IN_PROGRESS", label: "진행 중" },
            { value: "COMPLETED", label: "완료" },
            { value: "CANCELED", label: "취소" },
          ]}
        />
      </Col>

      <Col xs={24} sm={12} md={5}>
        <Input
          placeholder="부서명 입력 (예: 개발3팀)"
          value={filters.deptName}
          onChange={(e) => handleChange("deptName", e.target.value)}
        />
      </Col>

      <Col xs={24} sm={12} md={4}>
        <Button type="primary" onClick={handleSearch} block>
          검색
        </Button>
      </Col>
    </Row>
  );
};

export default ProjectSearchBar;
