import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AvgYearsChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="deptName" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="avgYears" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

export default AvgYearsChart;
