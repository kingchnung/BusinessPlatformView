import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import dayjs from "dayjs";
import { Typography } from "antd";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Text } = Typography;

/**
 * ✅ ProjectGanttChart (최종 버전)
 * - 월 단위 진행중 프로젝트 일정 시각화
 * - 오늘 기준선 + 명확한 날짜 눈금 + 심플한 전체폭 구조
 */
const ProjectGanttChart = ({ data = [], month }) => {
  if (!data.length) return null;

  // ✅ 이번달 범위
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const daysInMonth = endOfMonth.diff(startOfMonth, "day") + 1;

  // ✅ 오늘 날짜 기준 (이번달 안일 경우만 표시)
  const today = dayjs();
  const todayIndex = today.isBetween(startOfMonth, endOfMonth, "day", "[]")
    ? today.diff(startOfMonth, "day")
    : null;

  // ✅ X축 날짜 눈금 (1일, 5일, 10일, 15일, 20일, 25일, 말일)
  const tickValues = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => d === 1 || d % 5 === 0 || d === daysInMonth
  );

  // ✅ 데이터 변환
  const chartData = data.map((p) => {
    const s = dayjs(p.startDate);
    const e = dayjs(p.endDate);

    // 이번달 안으로 자르기
    const barStart = s.isBefore(startOfMonth) ? startOfMonth : s;
    const barEnd = e.isAfter(endOfMonth) ? endOfMonth : e;
    const duration = barEnd.diff(barStart, "day") + 1;

    return {
      name: p.projectName,
      startIndex: barStart.diff(startOfMonth, "day"),
      duration,
      progress: p.progressRate,
    };
  });

  // ✅ 진행률별 색상 구분
  const getColor = (progress) => {
    if (progress >= 90) return "#82ca9d"; // 완료 임박 - 초록
    if (progress >= 50) return "#8884d8"; // 중간 진행 - 파랑
    return "#ffc658"; // 낮은 진행률 - 노랑
  };

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
        >
          {/* ✅ Y축: 프로젝트명 */}
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 13, fill: "#333" }}
          />

          {/* ✅ X축: 날짜 (1~말일) */}
          <XAxis
            type="number"
            domain={[0, daysInMonth - 1]}
            ticks={tickValues.map((v) => v - 1)}
            tickFormatter={(day) => startOfMonth.add(day, "day").format("DD")}
            tick={{ fontSize: 12, fill: "#666" }}
            axisLine={{ stroke: "#ccc" }}
            tickLine={{ stroke: "#ccc" }}
          />

          {/* ✅ 오늘 날짜 기준선 */}
          {todayIndex !== null && (
            <ReferenceLine
              x={todayIndex}
              stroke="#ff4d4f"
              strokeDasharray="3 3"
              label={{
                position: "top",
                value: "오늘",
                fill: "#ff4d4f",
                fontSize: 12,
              }}
            />
          )}

          {/* ✅ 막대 렌더링 (하나의 Bar로 전체 데이터 표현) */}
          <Bar
            dataKey="duration"
            barSize={20}
            shape={(props) => {
              const item = chartData[props.index];
              if (!item) return null;

              const barX = item.startIndex;
              const barWidth = item.duration;
              const color = getColor(item.progress);

              // props.width 는 전체 그래프의 X축 길이
              return (
                <rect
                  x={props.x + (barX / daysInMonth) * props.width}
                  y={props.y}
                  width={(barWidth / daysInMonth) * props.width}
                  height={props.height}
                  rx={4}
                  ry={4}
                  fill={color}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ 하단 날짜 범위 표시 */}
      <div
        style={{
          textAlign: "right",
          fontSize: 13,
          color: "#888",
          marginTop: 4,
        }}
      >
        {startOfMonth.format("YYYY.MM.DD")} ~ {endOfMonth.format("MM.DD")}
      </div>
    </div>
  );
};

export default ProjectGanttChart;
