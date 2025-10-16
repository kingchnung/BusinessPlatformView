import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AvgAgeChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="deptName" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="avgAge" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

export default AvgAgeChart;
