import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

const membershipColors = {
  무료: "#4CAF50",
  지불됨: "#2196F3",
  금: "#FFC107",
  지지자: "#E91E63",
};

const MembershipChart = ({ membershipData }) => {
  // Transform the data into the format expected by the chart
  const formattedData = [
    { type: "무료", members: membershipData?.Free || 0 },
    { type: "지불됨", members: membershipData?.Paid || 0 },
    { type: "금", members: membershipData?.Gold || 0 },
    { type: "지지자", members: membershipData?.Supporter || 0 },
  ];

  const totalMembers = formattedData.reduce(
    (sum, item) => sum + item.members,
    0
  );

  // Format large numbers
  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium">{`${
            payload[0].payload.type
          }: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2 border border-gray-300 shadow-none">
      <CardHeader className="py-4">
        <CardTitle className="text-lg">회원 분포</CardTitle>
        <CardDescription className="text-xs">
          유형별 현재 회원 수
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="members" fill="#8884d8" radius={[4, 4, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={membershipColors[entry.type]}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-xs">
        <div className="flex gap-2 font-medium leading-none">
          총 회원 수: {totalMembers.toLocaleString()}
        </div>
        <div className="leading-none text-muted-foreground">
          회원 유형의 현재 분포 표시
        </div>
      </CardFooter>
    </Card>
  );
};

export default MembershipChart;
