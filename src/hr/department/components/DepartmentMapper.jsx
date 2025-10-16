import { useState } from "react";
import EmployeeStatusCounter from "../../employee/components/EmployeeStatusCounter";

/**
 * 📈 DepartmentStatusMapper
 * EmployeeStatusCounter의 데이터를 부서별 매핑 형태로 전달
 * props:
 *   onMapped: (statusMap) => void
 *   예시: { 10: { breakCount: 2, retiredCount: 1 }, 20: { breakCount: 1, retiredCount: 0 } }
 */
const DepartmentMapper = ({ onMapped }) => {
  const [statusMap, setStatusMap] = useState({});

  const handleStatusData = (statusList) => {
    const map = statusList.reduce((acc, item) => {
      acc[item.deptId] = {
        breakCount: item.breakCount,
        retiredCount: item.retiredCount,
      };
      return acc;
    }, {});
    setStatusMap(map);
    if (typeof onMapped === "function") onMapped(map);
  };

  return <EmployeeStatusCounter onDataReady={handleStatusData} />;
};

export default DepartmentMapper;
