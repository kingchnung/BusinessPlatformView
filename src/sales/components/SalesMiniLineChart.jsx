import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Spin, Empty, Typography, Button } from "antd";
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { fetchPeriodSalesStatus, clearSalesStatusError } from "../slice/salesStatusSlice";
import { setSelectedYear as setTargetSelectedYear } from "../slice/salesTargetSlice";

const { Text } = Typography;

const formatCurrency = (v) =>
  v || v === 0 ? Number(v).toLocaleString("ko-KR") : "0";

export default function SalesMiniLineChart({ height = 320, showHeader = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { periodStatusList, periodStatusLoading, error: periodError } =
    useSelector((s) => s.salesStatus);

  const selectedYear = useSelector((s) => s.salesTarget.selectedYear);

  // 연도 기본값 보정(없으면 올해로 세팅)
  useEffect(() => {
    if (!selectedYear) {
      dispatch(setTargetSelectedYear(dayjs().year()));
    }
  }, [selectedYear, dispatch]);

  // 월별 매출/목표 로딩
  useEffect(() => {
    if (!selectedYear) return;
    dispatch(fetchPeriodSalesStatus({ year: selectedYear }));
  }, [selectedYear, dispatch]);

  // 에러 발생 시 한 번만 정리
  useEffect(() => {
    if (periodError) {
      // 메인 위젯이라 message 대신 조용히 상태만 초기화
      dispatch(clearSalesStatusError());
    }
  }, [periodError, dispatch]);

  const monthlyChartData = useMemo(() => {
    if (!periodStatusList?.length) return [];
    return periodStatusList.map((it) => ({
      monthLabel: `${it.month}월`,
      targetAmount: Number(it.targetAmount || 0),
      salesAmount: Number(it.salesAmount || 0),
    }));
  }, [periodStatusList]);

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      {showHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Text strong>{selectedYear || dayjs().year()}년 월별 매출 vs 목표</Text>
          <Button size="small" onClick={() => navigate("/sales/sales/report")}>자세히 보기</Button>
        </div>
      )}

      <Spin spinning={periodStatusLoading}>
        {monthlyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={monthlyChartData}
              margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis tickFormatter={formatCurrency} width={80} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="targetAmount"
                name="월 목표액"
                stroke="#b9b0b0ff"
                strokeWidth={1}
                dot={{ r: 3 }}           // 점 크기
                activeDot={{ r: 5 }}     // hover 시 점 크기
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="salesAmount"
                name="월 매출액"
                stroke="#479ef6ff"
                strokeWidth={1}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          !periodStatusLoading && (
            <Empty description="월별 데이터가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )
        )}
      </Spin>
    </div>
  );
}
