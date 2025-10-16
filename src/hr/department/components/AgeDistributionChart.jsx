import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

const AgeDistributionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="count"
        nameKey="label"
        cx="50%"
        cy="50%"
        outerRadius={80}
        //label={({ name, value }) => `${name} : ${value}명`} // 🟢 각 조각 위에 표시
        labelLine={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>

      {/* 🟡 인원 수 툴팁 */}
      <Tooltip
        formatter={(value, name) => [`${value}명`, `${name}`]}
        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
      />

      {/* 🟣 하단 범례 (주석) */}
      <Legend
        verticalAlign="bottom"
        align="center"
        formatter={(value, entry, index) => {
          const count = data[index]?.count ?? 0;
          return `${value} : ${count}명`;
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default AgeDistributionChart;
