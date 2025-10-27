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
import { useNavigate } from "react-router-dom";

dayjs.extend(isBetween);
const { Text } = Typography;

const ProjectGanttChart = ({ data = [], month }) => {
  const navigate = useNavigate();
  if (!data.length) return null;

  // 이번달 범위
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const daysInMonth = endOfMonth.diff(startOfMonth, "day") + 1;

  // 오늘 인덱스
  const today = dayjs();
  const todayIndex = today.isBetween(startOfMonth, endOfMonth, "day", "[]")
    ? today.diff(startOfMonth, "day")
    : null;

  // X축 눈금
  const tickValues = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => d === 1 || d % 5 === 0 || d === daysInMonth
  );

  // 상태 표준화
  const norm = (s) => (s ? String(s).trim().toUpperCase() : "");

  // 상태 → 색상
  const STATUS_COLORS = {
    PLANNING: "#ffd666",     // 진행 전
    IN_PROGRESS: "#69c0ff",  // 진행 중
    COMPLETED: "#95de64",    // 완료
    CANCELED: "#d9d9d9",     // 종료/취소
  };
  const getColorByStatus = (status) => STATUS_COLORS[status] || "#ffc658";

  // 데이터 변환 (+ 상태 계산)
  const chartData = data.map((p) => {
    const s = dayjs(p.startDate);
    const e = dayjs(p.endDate);

    // 월 범위로 자르기
    const barStart = s.isBefore(startOfMonth) ? startOfMonth : s;
    const barEnd = e.isAfter(endOfMonth) ? endOfMonth : e;
    const duration = Math.max(1, barEnd.diff(barStart, "day") + 1);

    // 상태 계산
    const statusRaw = norm(p.status);
    let computedStatus;
    if (statusRaw === "CANCELED") {
      computedStatus = "CANCELED";
    } else if (statusRaw === "COMPLETED" || Number(p.progressRate) === 100 || today.isAfter(e, "day")) {
      computedStatus = "COMPLETED";
    } else if (today.isBefore(s, "day")) {
      computedStatus = "PLANNING";
    } else {
      computedStatus = "IN_PROGRESS";
    }

    return {
      id: p.projectId,                 // ✅ 상세 이동용 ID 포함
      name: p.projectName,
      startIndex: Math.max(0, barStart.diff(startOfMonth, "day")),
      duration,
      status: computedStatus,
    };
  });

  // 바 클릭 핸들러
  const handleBarClick = (projectId) => {
    if (!projectId) return;
    navigate(`/work/project/detail/${projectId}`);
  };

  return (
    <div style={{ width: "100%", height: 520 }}>
      <ResponsiveContainer width="100%" height={480}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 13, fill: "#333" }}
          />
          <XAxis
            type="number"
            domain={[0, daysInMonth - 1]}
            ticks={tickValues.map((v) => v - 1)}
            tickFormatter={(day) => startOfMonth.add(day, "day").format("DD")}
            tick={{ fontSize: 12, fill: "#666" }}
            axisLine={{ stroke: "#ccc" }}
            tickLine={{ stroke: "#ccc" }}
          />

          {todayIndex !== null && (
            <ReferenceLine
              x={todayIndex}
              stroke="#ff4d4f"
              strokeDasharray="3 3"
              label={{
                position: "insideTop",
                value: "오늘",
                fill: "#ff4d4f",
                fontSize: 11,
              }}
            />
          )}

          <Bar
            dataKey="duration"
            barSize={20}
            shape={(props) => {
              const item = chartData[props.index];
              if (!item) return null;

              const barX = item.startIndex;
              const barWidth = item.duration;
              const color = getColorByStatus(item.status);

              return (
                <rect
                  x={props.x + (barX / daysInMonth) * props.width}
                  y={props.y}
                  width={(barWidth / daysInMonth) * props.width}
                  height={props.height}
                  rx={4}
                  ry={4}
                  fill={color}
                  style={{ cursor: "pointer" }}           // ✅ 커서
                  onClick={() => handleBarClick(item.id)}  // ✅ 클릭 이동
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleBarClick(item.id);
                    }
                  }}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>

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