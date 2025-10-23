import React from "react";
import { Segmented } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const SalesAnalyticsTabs = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeValue = location.pathname.includes("/sales/sales/status")
    ? "list"
    : "graph";


  const options = [
    { label: "그래프", value: "graph" },
    { label: "리스트", value: "list" },
  ];

  const onChange = (value) => {
    if (value === "graph") navigate("/sales/sales/report");
    if (value === "list") navigate("/sales/sales/status");
  };

  return (
    <Segmented
      className={className}
      options={options}
      value={activeValue}
      onChange={onChange}
    />
  );
};

export default SalesAnalyticsTabs;