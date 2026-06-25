import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data) {
    return (
      <div className="p-6">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  const attendanceData = [
    { name: "Present", value: 85 },
    { name: "Absent", value: 15 },
  ];

  const monthlyData = [
    { month: "Jan", students: 5 },
    { month: "Feb", students: 8 },
    { month: "Mar", students: 12 },
    { month: "Apr", students: 15 },
    { month: "May", students: 18 },
    { month: "Jun", students: 22 },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Admin Dashboard
        </h1>

        <p className="text-gray-500">
          Student Management Analytics
        </p>
      </div>

      {/* STATS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg">👨‍🎓 Total Students</h3>
          <h2 className="text-4xl font-bold mt-3">
            {data.totalStudents}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg">📚 Total Courses</h3>
          <h2 className="text-4xl font-bold mt-3">
            {data.totalCourses}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg">📝 Total Enrollments</h3>
          <h2 className="text-4xl font-bold mt-3">
            {data.totalEnrollments}
          </h2>
        </div>

      </div>

      {/* CHARTS ROW 1 */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* BAR CHART */}

        <div className="bg-white rounded-3xl shadow-lg p-5">

          <h2 className="text-xl font-bold mb-5">
            Students Per Course
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={data.courseChart}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="title" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="students"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* PIE CHART */}

        <div className="bg-white rounded-3xl shadow-lg p-5">

          <h2 className="text-xl font-bold mb-5">
            Attendance Overview
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>

              <Pie
                data={attendanceData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {attendanceData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      

    </div>
  );
}

export default DashboardPage;