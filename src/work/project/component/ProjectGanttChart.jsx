import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell,
} from "recharts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";

dayjs.extend(isBetween);
const { Text } = Typography;

const STATUS_COLORS = {
  PLANNING: "#ffd666",     // 진행 전
  IN_PROGRESS: "#69c0ff",  // 진행 중
  COMPLETED: "#95de64",    // 완료
  CANCELED: "#d9d9d9",     // 종료
};

const norm = (s) => (s ? String(s).trim().toUpperCase() : "");

const ProjectGanttChart = ({ data = [], month }) => {
  const navigate = useNavigate();
  if (!data.length) return null;

  // 이번 달 범위
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const daysInMonth = endOfMonth.diff(startOfMonth, "day") + 1;

  // 오늘 선
  const today = dayjs();
  const todayIndex = today.isBetween(startOfMonth, endOfMonth, "day", "[]")
    ? today.diff(startOfMonth, "day")
    : null;

  // X축 눈금 (1, 5일 단위, 마지막)
  const tickValues = Array.from({ length: daysInMonth }, (_, i) => i)
    .filter((d) => d === 0 || (d + 1) % 5 === 0 || d === daysInMonth - 1);

  // 차트 데이터 변환
  const chartData = data
    .map((p) => {
      const s = dayjs(p.startDate);
      const e = dayjs(p.endDate);

      // 이번달 범위
      const barStart = s.isBefore(startOfMonth) ? startOfMonth : s;
      const barEnd = e.isAfter(endOfMonth) ? endOfMonth : e;

      // 이번달과의 교집합 일수 (겹치지 않으면 음수/0)
      const intersectionDays = barEnd.diff(barStart, "day") + 1;

      // ✅ 이번 달과 전혀 겹치지 않으면 제외
      if (intersectionDays < 1) return null;

      const offset = barStart.diff(startOfMonth, "day");      // 0~(daysInMonth-1)
      const duration = intersectionDays;                        // 1 이상 보장

      const raw = norm(p.status);
      let status;
      if (raw === "CANCELED") status = "CANCELED";
      else if (raw === "COMPLETED" || Number(p.progressRate) === 100 || today.isAfter(e, "day"))
        status = "COMPLETED";
      else if (today.isBefore(s, "day")) status = "PLANNING";
      else status = "IN_PROGRESS";

      return {
        id: p.projectId,
        name: p.projectName,
        offset,
        duration,                                 // 이번 달에 보이는 길이
        totalDuration: e.diff(s, "day") + 1,      // 전체 기간(툴팁용)
        startLabel: s.format("YYYY.MM.DD"),
        endLabel: e.format("YYYY.MM.DD"),
        status,
      };
    })
    .filter(Boolean); // ← null(겹치지 않는 항목) 제거

  // 막대 클릭 → 상세
  const handleBarClick = (payload) => {
    if (payload?.id) navigate(`/work/project/detail/${payload.id}`);
  };

  return (
    <div style={{ width: "100%", height: 520 }}>
      <ResponsiveContainer width="100%" height={480}>
        <BarChart
          layout="vertical"
          data={chartData}
          // ← 왼쪽 여백 줄이고(Y축 폭도 아래에서 조정) 전체 좌측 공백 최소화
          margin={{ top: 20, right: 24, left: 0, bottom: 20 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            width={160}                            // ← Y축 레이블 영역(너무 크면 좌측이 넓어짐)
            tick={{ fontSize: 13, fill: "#333" }}
            tickLine={false}
          />
          <XAxis
            type="number"
            domain={[0, daysInMonth]}
            ticks={tickValues}
            tickFormatter={(d) => startOfMonth.add(d, "day").format("DD")}
            tick={{ fontSize: 12, fill: "#666" }}
            axisLine={{ stroke: "#ddd" }}
            tickLine={{ stroke: "#ddd" }}
          />

          {todayIndex !== null && (
            <ReferenceLine
              x={todayIndex}
              stroke="#ff4d4f"
              strokeDasharray="3 3"
              label={{ position: "insideTop", value: "오늘", fill: "#ff4d4f", fontSize: 11 }}
            />
          )}

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              // duration 바의 payload를 쓰자 (stack이라 맨 끝이 duration)
              const row = payload[payload.length - 1]?.payload;
              if (!row) return null;
              return (
                <div style={{
                  background: "white",
                  border: "1px solid #eaeaea",
                  padding: "8px 10px",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.name}</div>
                  <div>전체 기간 : <b>{row.totalDuration}</b>일</div>
                  <div>일정 : {row.startLabel} ~ {row.endLabel}</div>
                </div>
              );
            }}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />

          {/* 1) 투명 오프셋 (위치만 이동) */}
          <Bar dataKey="offset" stackId="g" fill="transparent" isAnimationActive={false} />

          {/* 2) 실제 막대 (길이만 표현) */}
          <Bar
            dataKey="duration"
            stackId="g"
            radius={[0, 6, 6, 0]}
            barSize={20}
            onClick={(_, index) => handleBarClick(chartData[index])}
          >
            {chartData.map((row, i) => (
              <Cell key={row.id ?? i} fill={STATUS_COLORS[row.status] || "#ffc658"} cursor="pointer" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 범례 + 기간 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          borderTop: "1px solid #f0f0f0",
          padding: "8px 4px",
          marginTop: 8,
          fontSize: 13,
          color: "#888",
        }}
      >
        <span>
          {startOfMonth.format("YYYY.MM.DD")} ~ {endOfMonth.format("MM.DD")}
        </span>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { label: "진행 전", key: "PLANNING" },
            { label: "진행 중", key: "IN_PROGRESS" },
            { label: "완료", key: "COMPLETED" },
            { label: "종료", key: "CANCELED" },
          ].map((it) => (
            <span key={it.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: STATUS_COLORS[it.key],
                  display: "inline-block",
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{it.label}</Text>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectGanttChart;